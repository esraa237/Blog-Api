const User = require("../models/User");
const AppError = require("../utils/AppError");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    const totalUsers = await User.countDocuments();
    const users = await User.find().skip(skip).limit(limit);
    if (!users || users.length === 0) {
      return next(new AppError(`No Users Found`, StatusCodes.NOT_FOUND));
    }
    res.status(StatusCodes.OK).json({
      status: "success",
      results: users.length,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      data: users,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

exports.createUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new AppError(`All fields are required`, StatusCodes.BAD_REQUEST));
  }
  let role = "user";
  if (email === "admin@example.com") {
    role = "admin";
  }
  let id = 1;
  const lastuser = await User.findOne({}).sort({ id: -1 });
  if (lastuser) {
    id = lastuser.id + 1;
  }
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
    res.status(StatusCodes.CREATED).send(user);
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

exports.getUserById = async (req, res, next) => {
  console.log(req.params);
  const user = await User.findOne({ id: req.params.id });
  if (!user) {
    return next(new AppError(`User with id ${req.params.id} not found`, StatusCodes.NOT_FOUND));
  } else {
    res.status(StatusCodes.OK).send(user);
  }
};

exports.updateUserById = async (req, res, next) => {
  const user = await User.findOne({ id: req.params.id }).select("+password");
  if (!user) {
    return next(new AppError(`User with id ${req.params.id} not found`, StatusCodes.NOT_FOUND));
  } else {
    console.log(req.body);
    const {
      name = `${user.name}`,
      email = `${user.email}`,
      password = `${user.password}`,
    } = req.body;
    let hashedPassword = "";
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    user.name = name;
    user.email = email;
    user.password = hashedPassword === "" ? password : hashedPassword;
    user.updatedAt = Date.now();
    await user.save();
    res.status(StatusCodes.OK).send(user);
  }
};

exports.deleteUserById = async (req, res, next) => {
  const user = await User.findOne({ id: req.params.id });
  if (!user) {
    return next(new AppError(`User with id ${req.params.id} not found`, StatusCodes.NOT_FOUND));
  } else {
    await User.deleteOne({ id: req.params.id });
    res.status(StatusCodes.OK).send(`User with id ${req.params.id} deleted`);
  }
};
