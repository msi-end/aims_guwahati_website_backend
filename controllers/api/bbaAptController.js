const { prisma } = require("../../config/db");
const { sendSuccess, sendError } = require("../../utils/apiResponse");
const fs = require("fs");

exports.createBbaApplication = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (student.isFormSubmitted) {
      return sendError(
        res,
        "You have already submitted an application.",
        null,
        400
      );
    }

    const bbaData = {
      ...req.body,
      studentId: studentId,
      // If you use files, add paths here:
      // photoUrl: req.files?.photo ? req.files.photo[0].path : null,
    };

    // Use a Transaction to ensure both the application is saved AND student status is updated
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.bbaApplication.create({
        data: bbaData,
      });

      await tx.student.update({
        where: { id: studentId },
        data: {
          isFormSubmitted: true,
          selectedCourse: "BBA",
        },
      });

      return application;
    });

    return sendSuccess(
      res,
      "BBA Application submitted successfully",
      result,
      201
    );
  } catch (error) {
    console.error(error);
    return sendError(res, "Submission failed: " + error.message);
  }
};

// GET /api/bba/:id
exports.getBbaById = async (req, res) => {
  try {
    const application = await prisma.bbaApplication.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { student: true },
    });

    if (!application) return sendError(res, "Application not found", null, 404);
    return sendSuccess(res, "BBA Details retrieved", application);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// PATCH /api/bba/:id (Update status or details)
exports.updateBbaApplication = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedData = await prisma.bbaApplication.update({
      where: { id },
      data: req.body,
    });

    return sendSuccess(res, "Application updated successfully", updatedData);
  } catch (error) {
    return sendError(res, "Update failed: " + error.message);
  }
};

exports.updateApplicationFields = async (req, res) => {
  try {
    const { type = "bba", id } = req.params; // type: 'bba' or 'mba', id: application ID
    const updateData = req.body; // Only the fields the user wants to change

    // 1. Prevent updating sensitive relational IDs via this route
    const restrictedFields = ["id", "studentId", "createdAt", "applicationNo"];
    restrictedFields.forEach((field) => delete updateData[field]);

    // 2. Select the correct model
    const model =
      type.toLowerCase() === "bba"
        ? prisma.bbaApplication
        : prisma.mbaApplication;

    // 3. Check if record exists
    const existingRecord = await model.findFirst({
      where: { studentId: parseInt(id) },
    });

    if (!existingRecord) {
      return sendError(
        res,
        `${type.toUpperCase()} Application not found`,
        null,
        404
      );
    }
    // (Skip this check if the user is an Admin)
    // if (req.user.role !== "admin" && existingRecord.studentId !== req.user.id) {
    //   return sendError(
    //     res,
    //     "You do not have permission to update this record",
    //     null,
    //     403
    //   );
    // }

    const updatedRecord = await model.update({
      where: { id: existingRecord.id },
      data: updateData,
    });

    return sendSuccess(
      res,
      `${type.toUpperCase()} application updated successfully`,
      updatedRecord
    );
  } catch (error) {
    console.error("Update Error:", error);
    return sendError(res, "Failed to update fields: ");
  }
};
