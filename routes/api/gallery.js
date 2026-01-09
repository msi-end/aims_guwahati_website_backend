const express = require("express");
const router = express.Router();
const galleryCtrl = require("../../controllers/api/galleryController");
const auth = require("../../middleware/auth");
const upload = require("../../middleware/upload copy");
const { validateGallery } = require("../../validators/galleryValidator");

// Public Route
router.get("/", galleryCtrl.getGalleryItems);

// Admin Routes
router.post(
  "/",
  auth,
  upload.single("image"),
  validateGallery,
  galleryCtrl.createGalleryItem
);

router.patch("/:id/reorder", auth, galleryCtrl.reorderGallery);
router.delete("/:id", auth, galleryCtrl.deleteGalleryItem);

module.exports = router;
