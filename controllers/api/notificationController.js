const { prisma } = require("../../config/db");
const { sendSuccess, sendError } = require("../../utils/apiResponse");

// Read All Active Notifications
exports.getNotifications = async (req, res) => {
  try {
    const now = new Date();
    const notifications = await prisma.notification.findMany({
      where: {
        isActive: true,
        publishDate: { lte: now }, // Only show if published
        OR: [
          { endDate: null }, // No expiry
          // { endDate: { gte: now } }, // Or not yet expired
        ],
      },
      orderBy: { publishDate: "desc" },
    });

    return sendSuccess(
      res,
      "Notifications retrieved successfully",
      notifications
    );
  } catch (error) {
    return sendError(res, error.message);
  }
};
