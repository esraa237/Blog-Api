const User = require("../models/User");
const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new AppError(`All fields are required`, 400));
  }

  let role = "user"; // default
  if (email === "admin@example.com") role = "admin"; // special case

  let id = 1;
  const lastUser = await User.findOne({}).sort({ id: -1 });
  if (lastUser) id = lastUser.id + 1;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({
      id,
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    // Return only user data (no token)
    res.status(201).json({
      status: "success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new AppError(`Invalid credentials`, 404));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return next(new AppError(`Invalid credentials`, 404));

    // Generate token for login
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    next(err);
  }
};
