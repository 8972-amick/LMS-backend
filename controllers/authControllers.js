const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name.match(/^[A-Za-z\s]+$/))
      return res.status(400).json({ message: "Invalid name" });
    const existingUser = await User.findOne({ email });

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    console.log("User registered:", user);
    return res.status(201).json({ message: "Registered successfully" });
    
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
};
