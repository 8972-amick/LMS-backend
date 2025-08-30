const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, match: /^[A-Za-z\s]+$/ },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["borrower", "librarian"], default: "borrower" }
});

module.exports = mongoose.model("User", userSchema);
