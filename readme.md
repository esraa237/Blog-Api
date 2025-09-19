
---

# 🛡️ Blog API 

This  extends your blog API by adding full user authentication, role-based authorization, secure password handling, request validation, and enhanced Mongoose features.

---

## 📁 Project Structure

```
blog-api/
├── server.js
├── models/
│   ├── User.js
│   └── Post.js
├── routes/
│   ├── userRoutes.js
│   ├── postRoutes.js
│   └── authRoutes.js
├── middleware/
│   ├── auth.js            // JWT verification & role checks
│   └── validation.js      // Joi validators
└── controllers/
    └── authController.js
```

---

## 🚀 Setup

1. Clone your project or create a new folder.
2. Initialize your project:

   ```bash
   npm init -y
   npm install express mongoose morgan bcrypt jsonwebtoken joi dotenv
   ```
3. Create a `.env` file:

   ```
   MONGODB_URI=your_mongodb_connection
   JWT_SECRET=yourSecretKey
   ```

---

## ✅ Features

### 1. **User Authentication**

- **User model** stores name, email, hashed password, and role (user/admin).
- **Register Route:**`POST /api/auth/register`→ Validates input, hashes password, stores user.
- **Login Route:**`POST /api/auth/login`→ Validates credentials and returns a signed JWT.
- **JWT Middleware:**
  Validates JWT tokens and attaches user data to requests.

---

### 2. **Request Validation with Joi**

Middleware validators created for:

- User Registration
- User Login
- Post Creation & Updating

```js
// Example Joi validator
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user", "admin").optional()
});
```

---

### 3. **Role-Based Authorization**

- `role` field in user schema: `"user"` or `"admin"`
- Middleware verifies if user is:
  - The **author** of a post **OR**
  - An **admin**
- Admin-only routes are protected by role-checking logic

---

### 4. **Password Security**

- Uses **bcrypt** to hash passwords before storing.
- Password complexity rules enforced using Joi.
- Passwords are excluded from query results using `select: false`.

---

### 5. **Mongoose Enhancements**

#### ✅ Data Modeling Features:

- **Virtual Property:**Combines `firstName + lastName → fullName` (if split into parts)
- **Pre-save Middleware:**Hashes passwords using `pre("save")`
- **Populate:**Automatically fetch user data in post queries using `.populate("author", "name email")`
- **Custom Instance Method Example:**

  ```js
  userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
  };
  ```

---

### 6. **Testing Authentication**

- Protected route example:

  ```js
  router.get("/profile", verifyToken, (req, res) => {
    res.json(req.user);
  });
  ```
- Use **Postman** to:

  - Register/Login a user
  - Store token
  - Add `Authorization: <your_jwt>` header for protected routes

---

## 🔍 Example Routes

| Route                       | Method | Description                | Access    |
| --------------------------- | ------ | -------------------------- | --------- |
| `/api/auth/register`      | POST   | Register a new user        | Public    |
| `/api/auth/login`         | POST   | Login user, return JWT     | Public    |
| `/api/posts`              | GET    | List all posts             | Public    |
| `/api/posts`              | POST   | Create new post            | Auth Only |
| `/api/posts/:id`          | PUT    | Update post (author/admin) | Protected |
| `/api/posts/:id`          | DELETE | Delete post (author/admin) | Protected |
| `/api/posts/:id/comments` | POST   | Add a comment to a post    | Auth Only |

---

## 🔧 Tips & Resources

- [JWT Auth in Express](https://jwt.io/introduction)
- [Bcrypt Password Hashing](https://www.npmjs.com/package/bcrypt)
- [Joi Validation](https://joi.dev/api/)
- [Mongoose Populate](https://mongoosejs.com/docs/populate.html)
- Use `.env` to protect sensitive data

---

## 🧪 Testing Checklist

- [X] Register & login flow
- [X] JWT stored and reused in headers
- [X] Unauthorized requests are blocked
- [X] Only post author or admin can update/delete
- [X] Post creation/update uses validation
- [X] Passwords are hashed and never returned

---
