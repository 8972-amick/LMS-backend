import express from "express";
import {
  borrowBook,
  returnBook,
  getBorrowedBooks,
} from "../controllers/borrowControllers.js";

import verifyToken from "../Middleware/authMiddleware.js";
import allowRoles from "../Middleware/roleMiddleware.js";

const router = express.Router();

// Borrow a book
router.post("/", verifyToken, allowRoles("borrower"), borrowBook);

// Return a book
router.post("/return", verifyToken, allowRoles("borrower"), returnBook);

// Get all borrow records
router.get("/records", verifyToken, allowRoles("librarian"), getBorrowedBooks);

// Delete a borrow record
router.delete("/:id", verifyToken, allowRoles("librarian"), async (req, res) => {
  try {
    const borrowId = req.params.id;
    const borrow = await import("../models/Borrow.js").then(m => m.default.findById(borrowId));
    if (!borrow) return res.status(404).json({ message: "Borrow record not found" });

    // If the book is still borrowed, increase available count
    if (!borrow.returnDate) {
      const Book = await import("../models/Book.js").then(m => m.default);
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

export default router;
