const { prisma } = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendSuccess, sendError } = require("../../utils/apiResponse");



exports.registerStudent = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password, courseType } = req.body;

    // 1. Check for existing student
    const existingStudent = await prisma.student.findFirst({
      where: { OR: [{ email }, { mobileNumber }] },
    });

    if (existingStudent) {
      return sendError(res,"Email or Mobile Number already registered",null,400,);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await prisma.$transaction(async (tx) => {
      const prefix = courseType === "MBA" ? "0126001" : "0226001";
      const startRange = `${prefix}0`; // Search pattern

      const lastStudent = await tx.student.findFirst({
        where: {
          applicationNo: { startsWith: prefix },
        },
        orderBy: { applicationNo: "desc" },
      });

      let nextSequence = 1;
      if (lastStudent) {
        const lastSerial = parseInt(lastStudent.applicationNo.slice(-3));
        nextSequence = lastSerial + 1;
      }

      const applicationNo = `${prefix}${nextSequence.toString().padStart(3, "0")}`;
      const student = await tx.student.create({
        data: {
          applicationNo,
          fullName,
          email,
          mobileNumber,
          password: hashedPassword,
          selectedCourse: courseType || null,
        },
      });

      let applicationDetails = null;
      if (courseType === "BBA") {
        applicationDetails = await tx.bbaApplication.create({
          data: {
            studentId: student.id,
            fullName: student.fullName,
            email: student.email,
            mobileNumber: student.mobileNumber,
          },
        });
      } else if (courseType === "MBA") {
        applicationDetails = await tx.mbaApplication.create({
          data: {
            studentId: student.id,
            firstName: student.fullName.split(" ")[0] || "",
            lastName: student.fullName.split(" ").slice(1).join(" ") || "",
            mobileNumber: student.mobileNumber,
          },
        });
      }
      return { student, applicationDetails };
    });

    const token = jwt.sign(
      { id: result.student.id, applicationNo: result.student.applicationNo },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const { password: _, ...studentData } = result.student;
    return sendSuccess(res,"Registration successful",{
        token,
        student: studentData,
        application: result.applicationDetails,
      },
      201,
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return sendError(res, error.message);
  }
};

// POST /api/student/login
exports.loginStudent = async (req, res) => {
  try {
    const { applicationNo, email, password } = req.body;

    if (!applicationNo && !email && !password) {
      return sendError(
        res,
        "Please provide Application No/Email and Password",
        null,
        400,
      );
    }
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ applicationNo }, { email }],
      },
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
      { expiresIn: "1h" },
    );

    return sendSuccess(res, "Login successful", {
      token,
      student: {
        id: student.id,
        applicationNo: student.applicationNo,
        email: student.email,
        courseType: student.selectedCourse,
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
        400,
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
        400,
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
      201,
    );
  } catch (error) {
    console.error("Initialization Error:", error);
    return sendError(res, "Could not start application: " + error.message);
  }
};
