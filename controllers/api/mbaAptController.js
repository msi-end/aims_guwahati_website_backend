const prisma = require("../../config/db");
const { sendSuccess, sendError } = require("../../utils/apiResponse");

exports.createMbaApplication = async (req, res) => {
  try {
    const studentId = req.user.id;
    // 1. Check if student already submitted a form
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
    // 2. Prepare MBA Data
    // Note: Work experience and academic rows should be sent as stringified JSON
    // from the frontend since we are using @db.Text / String fields.
    const mbaData = {
      ...req.body,
      studentId: studentId,
      status: "pending",
      declaration: "true",
    };
    // 3. Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.mbaApplication.create({
        data: mbaData,
      });
      // Update central student record
      await tx.student.update({
        where: { id: studentId },
        data: {
          isFormSubmitted: true,
          selectedCourse: "MBA",
        },
      });

      return application;
    });
    return sendSuccess(
      res,
      "MBA Application submitted successfully",
      result,
      201
    );
  } catch (error) {
    console.error("MBA Submit Error:", error);
    return sendError(res, "Submission failed: " + error.message);
  }
};

exports.getMbaById = async (req, res) => {
  try {
    const application = await prisma.mbaApplication.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { student: true },
    });

    if (!application)
      return sendError(res, "MBA Application not found", null, 404);
    return sendSuccess(res, "MBA Details retrieved", application);
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.updateApplicationFields = async (req, res) => {
  try {
    const { type = "mba", id } = req.params;
    const updateData = req.body;

    // 1. Validate 'type' and map to the correct Prisma model
    const modelMap = {
      bba: prisma.bbaApplication,
      mba: prisma.mbaApplication,
    };

    const targetModel = modelMap[type.toLowerCase()];

    if (!targetModel) {
      return sendError(
        res,
        "Invalid application type. Use 'bba' or 'mba'.",
        null,
        400
      );
    }

    // 2. Security: Remove fields that should NEVER be updated via this route
    const blacklistedFields = ["id", "studentId", "createdAt", "applicationNo"];
    blacklistedFields.forEach((field) => delete updateData[field]);

    // 3. Check if the record exists
    const recordId = parseInt(id);
    const existingRecord = await targetModel.findUnique({
      where: { id: recordId },
    });

    if (!existingRecord) {
      return sendError(res, "Application record not found", null, 404);
    }

    // 4. Authorization Check
    // Ensure students can only update their own records, but admins can update any.
    if (req.user.role !== "admin" && existingRecord.studentId !== req.user.id) {
      return sendError(
        res,
        "Unauthorized: You cannot edit this application",
        null,
        403
      );
    }

    // 5. Perform the Dynamic Update
    // Prisma's 'update' only changes fields present in the 'data' object (Partial Update)
    const updatedRecord = await targetModel.update({
      where: { id: recordId },
      data: updateData,
    });

    return sendSuccess(
      res,
      `${type.toUpperCase()} application updated successfully`,
      updatedRecord
    );
  } catch (error) {
    console.error("Update Error:", error);
    return sendError(res, "Update failed: " + error.message);
  }
};
