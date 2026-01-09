const prisma = require("../../config/db");
const { sendSuccess, sendError } = require("../../utils/apiResponse");
const fs = require("fs");

// GET /api/gallery (Public - with filtering)
exports.getGalleryItems = async (req, res) => {
  try {
    const { category } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;

    const items = await prisma.gallery.findMany({
      where,
      orderBy: { displayOrder: "asc" },
    });
    return sendSuccess(res, "Gallery retrieved", items);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// POST /api/gallery (Admin only)
exports.createGalleryItem = async (req, res) => {
  try {
    if (!req.file) return sendError(res, "Image file is required", null, 400);

    const newItem = await prisma.gallery.create({
      data: {
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        image: req.file.path, // Store the file path
        displayOrder: parseInt(req.body.displayOrder) || 0,
      },
    });
    return sendSuccess(res, "Gallery item added", newItem, 201);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    return sendError(res, error.message);
  }
};

// PATCH /api/gallery/:id/reorder (Admin only)
exports.reorderGallery = async (req, res) => {
  try {
    const { displayOrder } = req.body;
    const updated = await prisma.gallery.update({
      where: { id: parseInt(req.params.id) },
      data: { displayOrder: parseInt(displayOrder) },
    });
    return sendSuccess(res, "Order updated", updated);
  } catch (error) {
    return sendError(res, "Update failed");
  }
};

// DELETE /api/gallery/:id (Admin only)
exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await prisma.gallery.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (item && fs.existsSync(item.image)) {
      fs.unlinkSync(item.image); // Delete physical file
    }

    await prisma.gallery.delete({ where: { id: parseInt(req.params.id) } });
    return sendSuccess(res, "Item deleted successfully");
  } catch (error) {
    return sendError(res, "Delete failed");
  }
};
