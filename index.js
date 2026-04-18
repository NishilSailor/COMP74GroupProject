import "./database.js"; 
import { handleBooks } from "./routes/books.js";
import { handleMembers } from "./routes/members.js";
import { handleLoans } from "./routes/loans.js";

const PORT = 3000;

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.startsWith("/books")) return handleBooks(req, url);
    if (path.startsWith("/members")) return handleMembers(req, url);
    if (path.startsWith("/loans")) return handleLoans(req, url);

    return new Response(JSON.stringify({ error: "Route not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
});

console.log(`Library API running on http://localhost:${PORT}`);