const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const postRoutes = require(path.join(__dirname, "routes/postsRoutes.js"));
const userRoutes = require(path.join(__dirname, "routes/usersRoutes.js"));
const authRoutes = require(path.join(__dirname, "routes/authRoutes.js"));
const auth = require(path.join(__dirname, "middleware/auth.js"));
require("dotenv").config();

const port = process.env.PORT??3000;
//check database connection
mongoose
.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connection success");
  })
  .catch((error) => {
    console.error(`connection fail :${error}`);
    process.exit(1);
  });

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node API Documentation",
      version: "1.0.0",
      description: "API documentation with Swagger",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
     components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./routes/*.js"], // هانكتب تعليقات Swagger في ملفات routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//routes
app.use("/api/posts", auth.verifyUser, postRoutes);
app.use("/api/users", auth.verifyUser, userRoutes);
app.use("/api/auth", authRoutes);

//global error
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
