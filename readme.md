
# Express Blog API

A RESTful Blog API built with **Express.js** and **MongoDB**, featuring user authentication, role-based authorization, and full CRUD operations for posts, including search functionality. Swagger is used for API documentation.

---

## Features

- **User Authentication**

  - Signup and login endpoints
  - JWT-based authentication
  - Password hashing and validation
- **Role-Based Authorization**

  - Admin and user roles
  - Only admins can manage other users
  - Post ownership validation
- **Posts**

  - Create, read, update, and delete posts
  - Search posts by title or content
  - Pagination support
  - Tags filtering
  - Comments with author population
- **Error Handling**

  - Centralized error handling using `AppError`
  - Consistent API error responses
- **API Documentation**

  - Swagger UI integration
  - Endpoint documentation and examples

---

## Project Structure

```
project-root/
├── controllers/
│   ├── authController.js
│   ├── postController.js
│   └── userController.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── models/
│   ├── Post.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── postsRoutes.js
│   └── usersRoutes.js
├── utils/
│   └── AppError.js
├── node_modules/
├── .env
├── .gitignore
├── launch.json
├── package-lock.json
├── package.json
├── readme.md
└── server.js
```

## Setup Instructions

1. Clone the repository:

```bash
git clone <repository_url>
cd <repository_folder>
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following variables:

```
PORT=5000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
```

4. Start the server:

```bash
npm run dev   # if using nodemon
# or
npm start     # for normal start
```

5. Open Swagger UI for API documentation:

```
http://localhost:5000/api-docs
```

---

## API Endpoints

### Users

* `POST /api/auth/signup` - Register a new user
* `POST /api/auth/login` - Login with email & password
* `GET /api/users` - Get all users (Admin only)
* `GET /api/users/:id` - Get user by ID (Admin only)
* `PUT /api/users/:id` - Update user (Admin only)
* `DELETE /api/users/:id` - Delete user (Admin only)

### Posts

* `GET /api/posts` - Get all posts (with pagination, author, and tags filtering)
* `POST /api/posts` - Create a post
* `GET /api/posts/:id` - Get post by ID
* `PUT /api/posts/:id` - Update post (Owner/Admin only)
* `DELETE /api/posts/:id` - Delete post (Owner/Admin only)
* `POST /api/posts/search` - Search posts by keyword
* `POST /api/posts/:id/comments` - Add a comment to a post

---

## Dependencies

* express
* mongoose
* jsonwebtoken
* bcryptjs
* dotenv
* swagger-jsdoc
* swagger-ui-express
* http-status-codes (optional)
