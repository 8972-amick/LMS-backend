const express = require("express");
const {
  createBook,
  getAllBooks,
  updateBook,
  deleteBook,
} = require("../controllers/bookControllers");

const verifyToken = require("../Middleware/authMiddleware");
const allowRoles = require("../Middleware/roleMiddleware");
const upload = require("../Middleware/uploadMiddleware"); 

const router = express.Router();



// Create a new book (with image)
router.post(
  "/",
  verifyToken,
  allowRoles("librarian"),
  upload.single("photo"), 
  createBook
);

// Get all books
router.get("/", getAllBooks);

// Update book (with optional new image)
router.put(
  "/:id",
  verifyToken,
  allowRoles("librarian"),
  upload.single("photo"),
  updateBook
);

// Delete book
router.delete("/:id", verifyToken, allowRoles("librarian"), deleteBook);

module.exports = router;
