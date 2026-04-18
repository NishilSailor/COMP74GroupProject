import db from "../database.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export async function handleLoans(req, url) {
  const method = req.method;
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[1] ? parseInt(parts[1]) : null;

  // ── GET /loans 
  if (method === "GET" && !id) {
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const member_id = url.searchParams.get("member_id");
    const offset = (page - 1) * limit;

    let loans, total;

    if (member_id) {
      loans = db.query("SELECT * FROM loans WHERE member_id = ? LIMIT ? OFFSET ?").all(parseInt(member_id), limit, offset);
      ({ total } = db.query("SELECT COUNT(*) as total FROM loans WHERE member_id = ?").get(parseInt(member_id)));
    } else {
      loans = db.query("SELECT * FROM loans LIMIT ? OFFSET ?").all(limit, offset);
      ({ total } = db.query("SELECT COUNT(*) as total FROM loans").get());
    }

    return json({ data: loans, page, limit, total });
  }

  // ── GET /loans/:id 
  if (method === "GET" && id) {
    const loan = db.query("SELECT * FROM loans WHERE id = ?").get(id);
    if (!loan) return json({ error: "Loan not found" }, 404);
    return json(loan);
  }

  // ── POST /loans 
  // Creates a new loan 
  if (method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { book_id, member_id } = body;

    if (!book_id || !member_id) {
      return json({ error: "book_id and member_id are required" }, 400);
    }

    // Make sure the book exists and has copies available
    const book = db.query("SELECT * FROM books WHERE id = ?").get(book_id);
    if (!book) return json({ error: "Book not found" }, 404);
    if (book.available_copies < 1) return json({ error: "No copies of this book are available" }, 400);

    // Make sure the member exists
    const member = db.query("SELECT * FROM members WHERE id = ?").get(member_id);
    if (!member) return json({ error: "Member not found" }, 404);

    const loan_date = new Date().toISOString().split("T")[0];

    const result = db.query(
      "INSERT INTO loans (book_id, member_id, loan_date) VALUES (?, ?, ?)"
    ).run(book_id, member_id, loan_date);

    // Reduce available copies by 1
    db.query("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?").run(book_id);

    const newLoan = db.query("SELECT * FROM loans WHERE id = ?").get(result.lastInsertRowid);
    return json(newLoan, 201);
  }

  // ── PUT /loans/:id 
  if (method === "PUT" && id) {
    const loan = db.query("SELECT * FROM loans WHERE id = ?").get(id);
    if (!loan) return json({ error: "Loan not found" }, 404);

    if (loan.return_date) {
      return json({ error: "This book has already been returned" }, 400);
    }

    const return_date = new Date().toISOString().split("T")[0];

    db.query("UPDATE loans SET return_date = ? WHERE id = ?").run(return_date, id);

    // Add the copy back as available
    db.query("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?").run(loan.book_id);

    const updated = db.query("SELECT * FROM loans WHERE id = ?").get(id);
    return json(updated);
  }

  // ── DELETE /loans/:id 
  if (method === "DELETE" && id) {
    const loan = db.query("SELECT * FROM loans WHERE id = ?").get(id);
    if (!loan) return json({ error: "Loan not found" }, 404);

    db.query("DELETE FROM loans WHERE id = ?").run(id);
    return json({ message: "Loan record deleted successfully" });
  }

  return json({ error: "Method not allowed" }, 405);
}