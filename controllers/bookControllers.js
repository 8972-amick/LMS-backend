const Book = require("../models/Book");
const Borrow = require("../models/Borrow");


exports.createBook = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { title, author, isbn, quantity } = req.body;

    if (!title || !author || !isbn || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid book data" });
    }

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res
        .status(400)
        .json({ message: "Book with this ISBN already exists" });
    }

    const book = new Book({
      title,
      author,
      isbn,
      quantity,
      available: quantity,
      photo: req.file ? `/uploads/books/${req.file.filename}` : null,
      visibleToBorrowers: true,
    });

    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error("Error creating book:", err);
    res
      .status(500)
      .json({ message: "Failed to create book", error: err.message });
  }
};


exports.getAllBooks = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const books = await Book.find();

    const updatedBooks = await Promise.all(
      books.map(async (book) => {
        let borrowedByMe = false;
        let borrowId = null;

        if (userId) {
          const borrowRecord = await Borrow.findOne({
            userId,
            bookId: book._id,
            returnDate: null,
          });
          if (borrowRecord) {
            borrowedByMe = true;
            borrowId = borrowRecord._id;
          }
        }

        return {
          ...book._doc,
          borrowedByMe,
          borrowId,
        };
      })
    );

    res.json(updatedBooks);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};


exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const { title, author, quantity } = req.body;
    if (title) book.title = title;
    if (author) book.author = author;

    if (quantity !== undefined) {
      const change = quantity - book.quantity;
      book.quantity = quantity;
      book.available = Math.max(0, book.available + change); // prevent negatives
    }

    if (req.file) {
      book.photo = `/uploads/books/${req.file.filename}`;
    }

    await book.save();
    res.json(book);
  } catch (err) {
    console.error("Error updating book:", err);
    res
      .status(500)
      .json({ message: "Failed to update book", error: err.message });
  }
};


exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error("Error deleting book:", err);
    res
      .status(500)
      .json({ message: "Failed to delete book", error: err.message });
  }
};
