const express = require("express");
const router = express.Router();
const notificationCtrl = require("../../controllers/api/notificationController");
const auth = require("../../middleware/auth");
const { validateGallery } = require("../../validators/galleryValidator");

// Public Route
router.get("/", notificationCtrl.getNotifications);


module.exports = router;
