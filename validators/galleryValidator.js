const { check, validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

exports.validateGallery = [
  check("title").notEmpty().withMessage("Title is required").trim(),
  check("category")
    .isIn(["campus", "facilities", "academic", "events", "sports"])
    .withMessage("Invalid category selected"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validation Error", errors.array(), 400);
    }
    next();
  },
];
