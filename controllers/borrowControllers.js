const Borrow = require("../models/Borrow");
const Book = require("../models/Book");

exports.borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.available < 1)
      return res.status(400).json({ message: "Book not available" });

    // Create borrow record
    const borrowRecord = new Borrow({
      userId,
      bookId,
    });

    await borrowRecord.save();

    book.available -= 1;
    await book.save();

    const populatedRecord = await Borrow.findById(borrowRecord._id)
      .populate("userId", "name email")
      .populate("bookId", "title author");

    res.status(201).json({
      message: "Book borrowed successfully",
      record: populatedRecord,
    });
  } catch (err) {
    console.error("Error borrowing book:", err);
    res
      .status(500)
      .json({ message: "Failed to borrow book", error: err.message });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  try {
    const { borrowId } = req.body;
    const userId = req.user.id;

    const borrowRecord = await Borrow.findOne({ _id: borrowId, userId });
    if (!borrowRecord)
      return res.status(404).json({ message: "Borrow record not found" });
    if (borrowRecord.returnDate)
      return res.status(400).json({ message: "Book already returned" });

    // Mark as returned
    borrowRecord.returnDate = new Date();
    await borrowRecord.save();

    // Increase available count if book exists
    const book = await Book.findById(borrowRecord.bookId);
    if (book) {
      book.available += 1;
      await book.save();
    }

    const populatedRecord = await Borrow.findById(borrowRecord._id)
      .populate("userId", "name email")
      .populate("bookId", "title author");

    res.json({
      message: "Book returned successfully",
      record: populatedRecord,
    });
  } catch (err) {
    console.error("Error returning book:", err);
    res
      .status(500)
      .json({ message: "Failed to return book", error: err.message });
  }
};

// Get all borrow records (for librarian)
exports.getAllBorrowRecords = async (req, res) => {
  try {
    const records = await Borrow.find()
      .populate("userId", "name email")
      .populate("bookId", "title author")
      .sort({ borrowDate: -1 });

    const formatted = records.map((r) => ({
      _id: r._id,
      user: r.userId ? r.userId.name : "Unknown User",
      email: r.userId ? r.userId.email : "N/A",
      book: r.bookId ? r.bookId.title : "Deleted Book",
      author: r.bookId ? r.bookId.author : "-",
      borrowDate: r.borrowDate,
      returnDate: r.returnDate,
      status: r.returnDate ? "Returned" : "Borrowed",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching borrow records:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch borrow records", error: err.message });
  }
};
