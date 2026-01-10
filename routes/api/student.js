const express = require("express");
const router = express.Router();
const studentController = require("../../controllers/api/StudentAuthController");
const authMiddleware = require("../../middleware/auth");

// Public Routes
router.post("/register", studentController.registerStudent);
router.post("/login", studentController.loginStudent);
router.post("/initialize-course", authMiddleware, studentController.initializeCourse);


// Protected Routes (Requires JWT)
router.get("/me", (req, res) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return sendError(res, "Not authorized, no token provided", null, 401);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.json(req.user);
  } catch (error) {
    return sendError(res, "Not authorized, token failed", null, 401);
  }
});

module.exports = router;
