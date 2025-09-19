const Joi = require("joi");
const AppError = require("../utils/AppError");

// Define schema for signin and signup validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});
const signUpSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});

const validateSignIn = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
  next();
};
const validateSignUp = (req, res, next) => {
  const { error } = signUpSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
  next();
};

//post validation schema
const PostSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).required(),
});
const createPostSchema = (req, res, next) => {
  const { error } = PostSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
  next();
};

//exports functions
module.exports = { validateSignIn, validateSignUp, createPostSchema };
