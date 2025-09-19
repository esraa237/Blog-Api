const Post = require("../models/Post");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/AppError");

const formatPost = (post) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  author: post.author ? post.author.name : null,
  tags: post.tags,
  comments: post.comments.map((c) => ({
    text: c.text,
    author: c.author ? c.author.name : null,
    date: c.date.toString(),
  })),
  createdAt: post.createdAt.toString(),
  updatedAt: post.updatedAt.toString(),
});

exports.getAllPosts = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, author, tags } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (author) filter.author = author;
    if (tags) filter.tags = { $in: tags.split(",") }; // tags=tag1,tag2

    const totalPosts = await Post.countDocuments(filter);

    const posts = await Post.find(filter)
      .populate("author", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
      return next(new AppError(`No Posts Found`, StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      results: posts.length,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      data: posts,
    });
  } catch (error) {
    return next(new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

// GET /api/posts/search?query=something
exports.searchPosts = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    if (!query) {
      return next(new AppError("Query parameter is required", StatusCodes.BAD_REQUEST));
    }

    const skip = (page - 1) * limit;

    // Search using regex (case-insensitive)
    const searchFilter = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    };

    const totalPosts = await Post.countDocuments(searchFilter);

    const posts = await Post.find(searchFilter)
      .populate("author", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
      return next(new AppError("No posts found for this query", StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      results: posts.length,
      totalPosts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPosts / limit),
      data: posts,
    });
  } catch (error) {
    return next(new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.createpost = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content || !tags) {
      return next(new AppError(`All fields are required`, StatusCodes.BAD_REQUEST));
    }

    let id = 1;
    const lastpost = await Post.findOne({}).sort({ id: -1 });
    if (lastpost) {
      id = lastpost.id + 1;
    }

    const post = new Post({
      id,
      title,
      content,
      tags,
      author: req.user._id, // author from JWT
    });

    await post.save();

    // populate author before sending response
    const populatedPost = await Post.findById(post._id).populate("author", {
      _id: 0,
      name: 1,
    });

    res.status(StatusCodes.CREATED).json(formatPost(populatedPost));
  } catch (error) {
    return next(new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.getPostById = async (req, res, next) => {
  console.log(req.params);
  const post = await Post.findOne({ id: req.params.id });
  if (!post) {
    return next(new AppError(`Post with id ${req.params.id} not found`, StatusCodes.NOT_FOUND));
  } else {
    post.populate("author", "name email");
    res.status(StatusCodes.OK).json(formatPost(post));

  }
};

exports.updatePostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({ id: parseInt(req.params.id) });
    if (!post) {
      return next(new AppError(`Post with id ${req.params.id} not found`, StatusCodes.NOT_FOUND));
    }

    const { title, content, tags } = req.body;

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.author = req.user._id;
    post.updatedAt = Date.now();

    await post.save();

    // populate author before sending response
    const populatedPost = await Post.findById(post._id).populate("author", {
      _id: 0,
      name: 1,
    });
    res.status(StatusCodes.OK).json(formatPost(populatedPost));
  } catch (error) {
    return next(new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.deletePostById = async (req, res, next) => {
  const post = await Post.findOne({ id: req.params.id });
  if (!post) {
    return next(new AppError(`Post with id ${req.params.id} not found`, StatusCodes.NOT_FOUND));
  } else {
    await Post.deleteOne({ id: req.params.id });
    res.status(StatusCodes.OK).send({ message: `Post with id ${req.params.id} deleted` });
  }
};

exports.addCommentToPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ id: parseInt(req.params.id) });
    if (!post) {
      return next(new AppError(`Post with id ${req.params.id} not found`, StatusCodes.NOT_FOUND));
    }

    const { text } = req.body;
    if (!text) {
      return next(new AppError("Comment text is required", StatusCodes.BAD_REQUEST));
    }

    const comment = {
      text,
      author: req.user._id,
      date: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    // populate author of comments
    const populatedPost = await Post.findOne({ id: parseInt(req.params.id) })
      .populate("author", "name -_id")
      .populate("comments.author", "name -_id");

    res.status(StatusCodes.OK).json(formatPost(populatedPost));
  } catch (error) {
    return next(new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};
