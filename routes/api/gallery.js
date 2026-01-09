const express = require("express");
const router = express.Router();
const galleryCtrl = require("../../controllers/api/galleryController");
const auth = require("../../middleware/auth");
const upload = require("../../middleware/upload copy");
const { validateGallery } = require("../../validators/galleryValidator");

// Public Route
router.get("/", galleryCtrl.getGalleryItems);


module.exports = router;
