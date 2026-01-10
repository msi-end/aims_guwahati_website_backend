const express = require("express");
const router = express.Router();
const bbaController = require("../../controllers/api/bbaAptController");
const mbaController = require("../../controllers/api/mbaAptController");
const auth = require("../../middleware/auth");
const upload = require("../../middleware/upload copy");
const { validateAdmission } = require("../../validators/admissionValidator");

// --- BBA Specific ---
router.post("/bba/submit", protect, bbaController.createBbaApplication);
router.get("/bba/:id", protect, bbaController.getBbaById);

router.patch("/update/:id", protect, mbaController.updateApplicationFields);


// --- MBA Specific ---
router.post("/mba/submit", protect, mbaController.createMbaApplication);
router.get("/mba/:id", protect, mbaController.getMbaById);

router.patch("/update/:id", protect, mbaController.updateApplicationFields);

module.exports = router;
