const prisma = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendSuccess, sendError } = require("../../utils/apiResponse");

// POST /api/auth/register (First time only)
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findFirst();
    if (existingAdmin) {
      return sendError(res, "Admin already registered. Use login.", null, 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await prisma.adminUser.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "admin",
      },
    });

    // Exclude password from response
    const { password: _, ...adminData } = newAdmin;
    return sendSuccess(res, "Admin registered successfully", adminData, 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Find user
    const user = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      return sendError(
        res,
        "Invalid credentials or account inactive",
        null,
        401
      );
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", null, 401);
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4. Update last login
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return sendSuccess(res, "Login successful", {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// GET /api/auth/verify
exports.verifyToken = async (req, res) => {
  // This uses the auth middleware, so if it reaches here, the token is valid
  return sendSuccess(res, "Token is valid", { user: req.user });
};
