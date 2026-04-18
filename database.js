import { Database } from "bun:sqlite";

const db = new Database("library.db");

// Create the books table
db.run(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT,
    total_copies INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1
  )
`);

// Create the members table
db.run(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT
  )
`);

// Create the loans table
db.run(`
  CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    loan_date TEXT NOT NULL,
    return_date TEXT,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
  )
`);

const { count } = db.query("SELECT COUNT(*) as count FROM books").get();

if (count === 0) {
  db.run(`
    INSERT INTO books (title, author, genre, total_copies, available_copies) VALUES
    ('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 3, 3),
    ('To Kill a Mockingbird', 'Harper Lee', 'Fiction', 2, 2),
    ('1984', 'George Orwell', 'Dystopian', 4, 4),
    ('Clean Code', 'Robert C. Martin', 'Technology', 2, 2),
    ('Dune', 'Frank Herbert', 'Science Fiction', 3, 3)
  `);

  db.run(`
    INSERT INTO members (name, email, phone) VALUES
    ('Alice Johnson', 'alice@email.com', '555-0101'),
    ('Bob Smith', 'bob@email.com', '555-0102'),
    ('Carol White', 'carol@email.com', '555-0103')
  `);

  console.log("Sample data added to the database.");
}

export default db;