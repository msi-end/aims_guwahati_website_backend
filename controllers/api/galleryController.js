const {prisma} = require("../../config/db");
const { sendSuccess, sendError } = require("../../utils/apiResponse");
const fs = require("fs");

exports.getGalleryItems = async (req, res) => {
  try {
    const { category } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;
    const items = await prisma.gallery.findMany({
      where,
      orderBy: { displayOrder: "asc" },
    });
    console.log(items);
    
    return sendSuccess(res, "Gallery retrieved", items);
  } catch (error) {
    return sendError(res, error.message);
  }
};

