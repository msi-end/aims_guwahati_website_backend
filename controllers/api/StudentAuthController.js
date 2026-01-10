const prisma = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendSuccess, sendError } = require("../../utils/apiResponse");

// Helper function to generate 10-digit Application Number
const generateApplicationNo = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

exports.registerStudent = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password } = req.body;

    // 1. Check if student already exists
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ email }, { mobileNumber }],
      },
    });
    if (existingStudent) {
      return sendError(
        res,
        "Email or Mobile Number already registered",
        null,
        400
      );
    }
    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // 3. Generate Unique Application Number
    let applicationNo = generateApplicationNo();
    // Ensure uniqueness (optional but recommended)
    const checkId = await prisma.student.findUnique({
      where: { applicationNo },
    });
    if (checkId) applicationNo = generateApplicationNo();

    // 4. Create Student
    const newStudent = await prisma.student.create({
      data: {
        applicationNo,
        fullName,
        email,
        mobileNumber,
        password: hashedPassword,
        paymentStatus: "pending",
        isFormSubmitted: false,
      },
    });

    const { password: _, ...studentData } = newStudent;
    return sendSuccess(res, "Registration successful", studentData, 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// POST /api/student/login
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find Student by Email
    const student = await prisma.student.findUnique({
      where: { email },
    });

    if (!student) {
      return sendError(res, "Invalid credentials", null, 401);
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", null, 401);
    }

    // 3. Generate JWT (Student scope)
    const token = jwt.sign(
      { id: student.id, role: "student", applicationNo: student.applicationNo },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return sendSuccess(res, "Login successful", {
      token,
      student: {
        id: student.id,
        applicationNo: student.applicationNo,
        fullName: student.fullName,
        paymentStatus: student.paymentStatus,
        isFormSubmitted: student.isFormSubmitted,
      },
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.initializeCourse = async (req, res) => {
  try {
    const { courseType } = req.body; // Expecting "BBA" or "MBA"
    const studentId = req.user.id;

    // 1. Validate Input
    if (!["BBA", "MBA"].includes(courseType)) {
      return sendError(
        res,
        "Invalid course selection. Choose BBA or MBA.",
        null,
        400
      );
    }
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        bbaApplications: { select: { id: true } },
        mbaApplications: { select: { id: true } },
      },
    });

    if (student.isFormSubmitted) {
      return sendError(
        res,
        "You have already submitted an application.",
        null,
        400
      );
    }
    const existingDraft =
      courseType === "BBA"
        ? student.bbaApplications[0]
        : student.mbaApplications[0];

    if (existingDraft) {
      return sendSuccess(res, `${courseType} application already initialized`, {
        applicationId: existingDraft.id,
        courseType,
      });
    }
    const result = await prisma.$transaction(async (tx) => {
      let newApp;

      if (courseType === "BBA") {
        newApp = await tx.bbaApplication.create({
          data: {
            studentId: studentId,
            fullName: student.fullName,
            email: student.email,
            mobileNumber: student.mobileNumber,
            dateOfBirth: "",
            category: "",
            nationality: "Indian",
            permanentAddress: "",
            fatherName: "",
            motherName: "",
            guardianName: "",
          },
        });
      } else {
        newApp = await tx.mbaApplication.create({
          data: {
            studentId: studentId,
            firstName: student.fullName.split(" ")[0] || "",
            lastName: student.fullName.split(" ").slice(1).join(" ") || "",
            mobileNumber: student.mobileNumber,
            dateOfBirth: "",
            category: "",
            nationality: "Indian",
            degree: "",
            specialisation: "",
            hasWorkExp: "no",
          },
        });
      }
      await tx.student.update({
        where: { id: studentId },
        data: { selectedCourse: courseType },
      });
      return newApp;
    });
    return sendSuccess(
      res,
      `${courseType} application initialized`,
      result,
      201
    );
  } catch (error) {
    console.error("Initialization Error:", error);
    return sendError(res, "Could not start application: " + error.message);
  }
};
