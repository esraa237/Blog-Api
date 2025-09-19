const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const Post = require("../models/Post");

const verifyUser = async (req, res, next) => {
  try {
    // 1. Get token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return next(new AppError("No token provided", 403));
    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Get user from DB
    const user = await User.findOne({ email: payload.email });
    console.log(user);
    if (!user) return next(new AppError("Invalid token", 403));

    // 4. Attach user to request
    req.user = user;

    next();
  } catch (err) {
    next(new AppError("Token validation failed", 403));
  }
};

// middlewares/verifyOwnershipOrAdmin.js

const verifyOwnershipOrAdmin = async (req, res, next) => {
  const postId = parseInt(req.params.id); 
  const userId = req.user._id;

  const post = await Post.findOne({ id: postId }); 
  if (!post) return next(new AppError("Post not found", 404));

  if (
    post.author.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new AppError("You are not allowed to modify this post", 403));
  }

  req.post = post; // optional: attach for reuse
  next();
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to access this resource", 403)
      );
    }
    next();
  };
}; //admin only can create users

module.exports = { verifyUser, verifyOwnershipOrAdmin, authorizeRoles };
