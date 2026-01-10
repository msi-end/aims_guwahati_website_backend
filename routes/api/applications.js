const express = require("express");
const router = express.Router();
const bbaController = require("../../controllers/api/bbaAptController");
const mbaController = require("../../controllers/api/mbaAptController");
const upload = require("../../middleware/studentFileupload");
const uploadController = require("../../controllers/api/uploadcontroller");
const authMiddleware = require("../../middleware/auth");

// --- BBA Specific ---
router.post("/bba/submit", authMiddleware, bbaController.createBbaApplication);
router.get("/bba/:id", authMiddleware, bbaController.getBbaById);

router.put("/bba/update/:id", authMiddleware, bbaController.updateApplicationFields);


// --- MBA Specific ---
router.post("/mba/submit", authMiddleware, mbaController.createMbaApplication);
router.get("/mba/:id", authMiddleware, mbaController.getMbaById);

router.put("/mba/update/:id", authMiddleware, mbaController.updateApplicationFields);

// ---Works On both BBA & MBA.  ---

router.put('/upload/:type/:id', authMiddleware, upload.any(), uploadController.uploadDocuments);
router.delete('/delete/:type/:id', authMiddleware, uploadController.deleteDocument);

module.exports = router;
