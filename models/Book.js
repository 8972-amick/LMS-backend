const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true, required: true },
  quantity: { type: Number, required: true, min: 1 },
  available: { type: Number, required: true, min: 0 },
  photo: { type: String }, 
  visibleToBorrowers: { type: Boolean, default: true } 
});

module.exports = mongoose.model("Book", bookSchema);
