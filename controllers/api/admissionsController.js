const prisma = require("../../config/db");
const { sendSuccess, sendError } = require("../../utils/apiResponse");
const fs = require("fs");

// POST /api/admissions (Public)
exports.createAdmission = async (req, res) => {
  try {
    const photoPath = req.file ? req.file.path : null;

    const admissionData = {
      ...req.body,
      percentageMarksClass10:
        parseFloat(req.body.percentageMarksClass10) || null,
      percentageMarksClass12:
        parseFloat(req.body.percentageMarksClass12) || null,
      passportPhotograph: photoPath,
      dateOfBirth: new Date(req.body.dateOfBirth),
    };

    const admission = await prisma.admission.create({ data: admissionData });
    return sendSuccess(
      res,
      "Application submitted successfully",
      admission,
      201
    );
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    return sendError(res, error.message);
  }
};

exports.getAdmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * limit;

    let where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
      ];
    }
    const [total, data] = await Promise.all([
      prisma.admission.count({ where }),
      prisma.admission.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return sendSuccess(res, "Admissions retrieved", {
      data,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};
// GET /api/admissions/:id (Admin Only)
exports.getAdmissionById = async (req, res) => {
  try {
    const admission = await prisma.admission.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!admission) return sendError(res, "Record not found", null, 404);
    return sendSuccess(res, "Admission details retrieved", admission);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// PATCH update status (Admin only) - THIS WAS MISSING
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const updated = await prisma.admission.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return sendSuccess(res, `Status updated to ${status}`, updated);
  } catch (error) {
    return sendError(res, "Failed to update status. Ensure the ID is correct.");
  }
};
// DELETE /api/admissions/:id (Admin Only)
exports.deleteAdmission = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Find the record first to get the image path
    const record = await prisma.admission.findUnique({ where: { id } });

    if (
      record?.passportPhotograph &&
      fs.existsSync(record.passportPhotograph)
    ) {
      fs.unlinkSync(record.passportPhotograph); // Remove image file
    }

    await prisma.admission.delete({ where: { id } });
    return sendSuccess(res, "Admission record deleted");
  } catch (error) {
    return sendError(res, "Delete failed or record doesn't exist");
  }
};
