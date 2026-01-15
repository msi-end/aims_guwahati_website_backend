const { prisma } = require("../../config/db");
const { sendSuccess, sendError } = require("../../utils/apiResponse");

// Read All Active Notifications
exports.getNotifications = async (req, res) => {
  try {
    // const now = new Date();
    const notifications = await prisma.notification.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(notifications);

    return sendSuccess(
      res,
      "Notifications retrieved successfully",
      notifications
    );
  } catch (error) {
    return sendError(res, error.message);
  }
};
