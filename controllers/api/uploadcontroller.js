const { prisma } = require("../../config/db");
const { sendSuccess, sendError } = require("../../utils/apiResponse");
const fs = require("fs");

exports.uploadDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, "No files uploaded", null, 400);
    }
    const { type } = req.params;
    const studentId = req.user.id ;
    // const studentId = 2 ;
    
    const model =
      type.toLowerCase() === "bba"
        ? prisma.bbaApplication
        : prisma.mbaApplication;

    const application = await model.findFirst({
      where: { studentId },
    });
console.log(type,studentId,application);

    if (!application) {
      req.files.forEach((f) => fs.unlinkSync(f.path));
      return sendError(res, "Unauthorized or record not found", null, 403);
    }

    const updateData = {};

    for (const file of req.files) {
      const fieldName = file.fieldname;
      const filePath = file.path;
      if (application[fieldName] && fs.existsSync(application[fieldName])) {
        fs.unlinkSync(application[fieldName]);
      }

      updateData[fieldName] = filePath;
    }

    await model.update({
      where: { id: application.id },
      data: updateData,
    });

    return sendSuccess(res, "Documents uploaded successfully", updateData);
  } catch (error) {
    if (req.files) {
      req.files.forEach((f) => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
    }
    return sendError(res, error.message);
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { type, id } = req.params; // 'bba' or 'mba' and record ID
    const { fieldName } = req.body; // e.g., 'photoUrl' or 'marksheet10Url'
    const studentId = req.user.id;

    // 1. Select Model
    const model =
      type.toLowerCase() === "BBA"
        ? prisma.bbaApplication
        : prisma.mbaApplication;

    const application = await model.findUnique({
      where: { id: parseInt(id) },
    });

    if (!application || application.studentId !== studentId) {
      return sendError(res, "Unauthorized or record not found", null, 403);
    }
    const filePath = application[fieldName];
    if (!filePath) {
      return sendError(res, "No file found for this field", null, 404);
    }
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Physical file deletion failed:", err);
      }
    }
    await model.update({
      where: { id: parseInt(id) },
      data: { [fieldName]: null },
    });

    return sendSuccess(res, `File deleted successfully from ${fieldName}`);
  } catch (error) {
    console.error("Delete Error:", error);
    return sendError(res, "Delete failed: " + error.message);
  }
};
