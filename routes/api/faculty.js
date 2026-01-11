const express = require("express");
const router = express.Router();
const facultyCtrl = require("../../controllers/api/facultyController");
const auth = require("../../middleware/auth");
const { validateGallery } = require("../../validators/galleryValidator");

// Public Route
router.get("/", facultyCtrl.getFaculty);
router.get("/:id", facultyCtrl.getFacultyById);


module.exports = router;
