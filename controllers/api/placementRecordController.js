const { prisma } = require("../../config/db");
const { sendSuccess, sendError } = require("../../utils/apiResponse");

// Read All Active Placement Records
exports.getPlacements = async (req, res) => {
  try {
    const placements = await prisma.placementRecord.findMany({
      where: {
        isActive: true, // Only show students whose records are marked as active
      },
      orderBy: {
        createdAt: "desc", // Show newest placements first
      },
      select: {
        id: true,
        studentName: true,
        photoUrl: true,
        companyName: true,
        designation: true,
        package: true,
        batchYear: true,
      },
    });

    // Logging for debugging (optional)
    console.log(`Fetched ${placements.length} placement records`);

    return sendSuccess(
      res,
      "Placement records retrieved successfully",
      placements,
    );
  } catch (error) {
    return sendError(res, error.message);
  }
};
