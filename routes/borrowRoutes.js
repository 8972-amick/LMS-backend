const express = require("express");
const {
  borrowBook,
  returnBook,
  getAllBorrowRecords,
} = require("../controllers/borrowControllers");

const verifyToken = require("../Middleware/authMiddleware");
const allowRoles = require("../Middleware/roleMiddleware");

const router = express.Router();

// Borrow a book 
router.post("/", verifyToken, allowRoles("borrower"), borrowBook);

// Return a book 
router.post("/return", verifyToken, allowRoles("borrower"), returnBook);

// Get all borrow records 
router.get("/records", verifyToken, allowRoles("librarian"), getAllBorrowRecords);

// Delete a borrow record
router.delete("/:id", verifyToken, allowRoles("librarian"), async (req, res) => {
  try {
    const borrowId = req.params.id;
    const borrow = await require("../models/Borrow").findById(borrowId);
    if (!borrow) return res.status(404).json({ message: "Borrow record not found" });

    // If the book is still borrowed, increase available count
    if (!borrow.returnDate) {
      const Book = require("../models/Book");
      const book = await Book.findById(borrow.bookId);
      if (book) {
        book.available += 1;
        await book.save();
      }
    }

    await borrow.deleteOne();
    res.json({ message: "Borrow record deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete borrow record", error: err.message });
  }
});

module.exports = router;
