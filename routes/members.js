import db from "../database.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export async function handleMembers(req, url) {
  const method = req.method;
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[1] ? parseInt(parts[1]) : null;

  // ── GET /members 
  if (method === "GET" && !id) {
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const members = db.query("SELECT * FROM members LIMIT ? OFFSET ?").all(limit, offset);
    const { total } = db.query("SELECT COUNT(*) as total FROM members").get();

    return json({ data: members, page, limit, total });
  }

  // ── GET /members/:id 
  if (method === "GET" && id) {
    const member = db.query("SELECT * FROM members WHERE id = ?").get(id);
    if (!member) return json({ error: "Member not found" }, 404);
    return json(member);
  }

  // ── POST /members 
  if (method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { name, email, phone } = body;

    if (!name || !email) {
      return json({ error: "name and email are required" }, 400);
    }

    const existing = db.query("SELECT id FROM members WHERE email = ?").get(email);
    if (existing) return json({ error: "A member with that email already exists" }, 409);

    const result = db.query(
      "INSERT INTO members (name, email, phone) VALUES (?, ?, ?)"
    ).run(name, email, phone || null);

    const newMember = db.query("SELECT * FROM members WHERE id = ?").get(result.lastInsertRowid);
    return json(newMember, 201);
  }

  // ── PUT /members/:id 
  if (method === "PUT" && id) {
    const member = db.query("SELECT * FROM members WHERE id = ?").get(id);
    if (!member) return json({ error: "Member not found" }, 404);

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const name = body.name || member.name;
    const email = body.email || member.email;
    const phone = body.phone !== undefined ? body.phone : member.phone;

    db.query(
      "UPDATE members SET name = ?, email = ?, phone = ? WHERE id = ?"
    ).run(name, email, phone, id);

    const updated = db.query("SELECT * FROM members WHERE id = ?").get(id);
    return json(updated);
  }

  // ── DELETE /members/:id 
  if (method === "DELETE" && id) {
    const member = db.query("SELECT * FROM members WHERE id = ?").get(id);
    if (!member) return json({ error: "Member not found" }, 404);

    db.query("DELETE FROM members WHERE id = ?").run(id);
    return json({ message: "Member deleted successfully" });
  }

  return json({ error: "Method not allowed" }, 405);
}