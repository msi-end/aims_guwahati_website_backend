const {prisma} = require("../../config/db");
const { sendSuccess, sendError } = require("../../utils/apiResponse");
const fs = require("fs");

exports.uploadDocument = async (req, res) => {
  try {
    const { type, id } = req.params; // 'BBA' or 'MBA' and record ID
    const studentId = req.user.id;

    if (!req.file) {
      return sendError(res, "No file provided", null, 400);
    }

    // 1. Select Model
    const model =
      type.toLowerCase() === "BBA"
        ? prisma.bbaApplication
        : prisma.mbaApplication;

    // 2. Security Check: Does this application belong to the student?
    const application = await model.findUnique({
      where: { id: parseInt(id) },
    });

    if (!application || application.studentId !== studentId) {
      // Clean up the uploaded file if unauthorized
      if (req.file) fs.unlinkSync(req.file.path);
      return sendError(res, "Unauthorized or record not found", null, 403);
    }

    // 3. Dynamic Field Mapping
    // fieldname comes from the frontend FormData key (e.g., 'photoUrl')
    const fieldName = req.file.fieldname;
    const filePath = req.file.path;

    // 4. Delete old file if it exists (Cleanup disk space)
    if (application[fieldName] && fs.existsSync(application[fieldName])) {
      try {
        fs.unlinkSync(application[fieldName]);
      } catch (err) {
        console.error("Old file deletion failed:", err);
      }
    }

    const updated = await model.update({
      where: { id: parseInt(id) },
      data: { [fieldName]: filePath },
    });

    return sendSuccess(res, "Document uploaded successfully", {
      field: fieldName,
      url: filePath,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    return sendError(res, error.message);
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { type, id } = req.params; // 'BBA' or 'MBA' and record ID
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

    // 3. Check if the field actually contains a file path
    const filePath = application[fieldName];
    if (!filePath) {
      return sendError(res, "No file found for this field", null, 404);
    }

    // 4. Physically delete the file from the 'uploads/' folder
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Physical file deletion failed:", err);
        // We continue to update the database even if the physical file is missing
      }
    }

    // 5. Update Database to set the field back to null
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
