import db from "../database.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export async function handleBooks(req, url) {
  const method = req.method;

  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[1] ? parseInt(parts[1]) : null;

  // ── GET /books 
  if (method === "GET" && !id) {
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const genre = url.searchParams.get("genre");
    const offset = (page - 1) * limit;

    let books, total;

    if (genre) {
      books = db.query("SELECT * FROM books WHERE genre = ? LIMIT ? OFFSET ?").all(genre, limit, offset);
      ({ total } = db.query("SELECT COUNT(*) as total FROM books WHERE genre = ?").get(genre));
    } else {
      books = db.query("SELECT * FROM books LIMIT ? OFFSET ?").all(limit, offset);
      ({ total } = db.query("SELECT COUNT(*) as total FROM books").get());
    }

    return json({ data: books, page, limit, total });
  }

  // ── GET /books/:id 
  if (method === "GET" && id) {
    const book = db.query("SELECT * FROM books WHERE id = ?").get(id);
    if (!book) return json({ error: "Book not found" }, 404);
    return json(book);
  }

  // ── POST /books 
  if (method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { title, author, genre, total_copies } = body;

    if (!title || !author) {
      return json({ error: "title and author are required" }, 400);
    }

    const copies = total_copies || 1;

    const result = db.query(
      "INSERT INTO books (title, author, genre, total_copies, available_copies) VALUES (?, ?, ?, ?, ?)"
    ).run(title, author, genre || null, copies, copies);

    const newBook = db.query("SELECT * FROM books WHERE id = ?").get(result.lastInsertRowid);
    return json(newBook, 201);
  }

  // ── PUT /books/:id 
  if (method === "PUT" && id) {
    const book = db.query("SELECT * FROM books WHERE id = ?").get(id);
    if (!book) return json({ error: "Book not found" }, 404);

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const title = body.title || book.title;
    const author = body.author || book.author;
    const genre = body.genre !== undefined ? body.genre : book.genre;
    const total_copies = body.total_copies || book.total_copies;
    const available_copies = body.available_copies !== undefined ? body.available_copies : book.available_copies;

    db.query(
      "UPDATE books SET title = ?, author = ?, genre = ?, total_copies = ?, available_copies = ? WHERE id = ?"
    ).run(title, author, genre, total_copies, available_copies, id);

    const updated = db.query("SELECT * FROM books WHERE id = ?").get(id);
    return json(updated);
  }

  // ── DELETE /books/:id   
  if (method === "DELETE" && id) {
    const book = db.query("SELECT * FROM books WHERE id = ?").get(id);
    if (!book) return json({ error: "Book not found" }, 404);

    db.query("DELETE FROM books WHERE id = ?").run(id);
    return json({ message: "Book deleted successfully" });
  }

  return json({ error: "Method not allowed" }, 405);
}