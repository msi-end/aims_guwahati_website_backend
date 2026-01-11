const { prisma } = require("../../config/db");
const { sendSuccess, sendError } = require("../../utils/apiResponse");

// Read All Faculty
exports.getFaculty = async (req, res) => {
  try {
    const faculty = await prisma.faculty.findMany({
      orderBy: { id: "asc" },
    });

    return sendSuccess(res, "Faculty list retrieved successfully", faculty);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// Read One Faculty by ID
exports.getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    const facultyMember = await prisma.faculty.findUnique({
      where: { id: parseInt(id) },
    });

    if (!facultyMember) {
      return sendError(res, "Faculty member not found", 404);
    }

    return sendSuccess(res, "Faculty member details retrieved", facultyMember);
  } catch (error) {
    return sendError(res, error.message);
  }
};
