const express = require("express");
const router = express.Router();
const placementsCtrl = require("../../controllers/api/placementRecordController");


// Public Route
router.get("/", placementsCtrl.getPlacements);


module.exports = router;
