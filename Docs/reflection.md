### **Group Reflection**



##### **Group Members:**

Nishil Sailor

Corson Shane

Bhavya Bhavsar





##### **What We Built:**

We built a REST API for a Library Management System using Bun and SQLite. The API lets users manage books, library members, and book loans. It supports full CRUD operations for all three

resources.



##### **Challenges We Faced:**

* One of the first challenges we ran into was deciding how to structure our resources. We debated whether loans should be their own resource or just an action on books. We ended up making loans their own resource because it made the relationships clearer and easier to query.
* Another challenge was handling the available\_copies count for books. When a loan is created, we need to decrease the count, and when a book is returned, we need to increase it again. We had to make sure these updates were tied to the right actions and couldn't be skipped.
* We also had to think carefully about validation. For example, what happens if someone tries to borrow a book that doesn't exist, or return a book that was already returned? Writing those checks took more thought than we expected.



##### **Decisions We Made:**

* We decided to keep the project in as few files as possible to keep things easy to read and follow. We split the routes into three separate files (books.js, members.js, loans.js) so each person could work on one without stepping on each other's code.
* We chose to use Bun's built-in SQLite library instead of installing an external package, which kept the setup simple and lightweight.
* For the return book action, we used PUT on the loan record instead of creating a separate endpoint, since it made sense as an update to an existing resource.



##### **What We Learned:**

This project helped us understand how REST APIs are actually structured in the real world. We now understand why proper HTTP status codes matter, how pagination works, and how relational data (like linking books and members through loans) needs to be designed carefully upfront.



##### **Group Contributions:**

###### To ensure everyone contributed equally, we divided the project based on our file structure and documentation requirements:

* Nishil: Handled the loans.js routing and business logic, specifically tackling the complex inventory math to decrement/increment available\_copies, and set up the main index.js server entry point.
* Corson Shane: Implemented the CRUD operations for books.js and members.js (including pagination and filtering), standardized our JSON error handling, and handled the final Postman testing.
* Bhavya Bhavsar: Designed the SQLite database schema (database.js), ensuring foreign keys were properly linked between the tables, and took charge of writing the openapi.yaml documentation.

