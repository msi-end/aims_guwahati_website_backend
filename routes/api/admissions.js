const express = require("express");
const router = express.Router();
const admissionCtrl = require("../../controllers/api/admissionsController");
const auth = require("../../middleware/auth");
const upload = require("../../middleware/upload copy");
const { validateAdmission } = require("../../validators/admissionValidator");

// Public route: Apply for admission
router.post(
  "/",
  upload.single("passportPhotograph"),
  validateAdmission,
  admissionCtrl.createAdmission
);
router.get("/", admissionCtrl.getAdmissions);
router.get("/:id", auth, admissionCtrl.getAdmissionById);
router.delete("/:id", auth, admissionCtrl.deleteAdmission);

module.exports = router;
