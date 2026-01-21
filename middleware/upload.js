const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadDirs = ["./uploads/passports", "./uploads/gallery"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Configure storage for passport photos
 */
const faculty = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/faculty");
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `faculty-${uniqueSuffix}${ext}`);
  },
});

/**
 * Configure storage for gallery images
 */
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/gallery");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `gallery-${uniqueSuffix}${ext}`);
  },
});

const placementRecords = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/placements");
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `placements-${uniqueSuffix}${ext}`);
  },
});


const imageFileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png/;

  // Check extension
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg and .png image files are allowed!"));
  }
};

/**
 * Multer configuration for passport photos
 */
const uploadPassport = multer({
  storage: faculty,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
}).single("image");

/**
 * Multer configuration for gallery images
 */
const uploadGallery = multer({
  storage: galleryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
}).single("image"); // Field name in form





/**
 * Multer configuration for multiple gallery images
 */
const uploadMultipleGallery = multer({
  storage: galleryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
}).array("images", 10); // Maximum 10 images


const uploadPlacementRecords = multer({
  storage: placementRecords,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
}).single("image");


/**
 * Middleware wrapper for passport upload with error handling
 */
const uploadPassportMiddleware = (req, res, next) => {
  uploadPassport(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      // Custom errors (like file type validation)
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    // Success - file uploaded
    next();
  });
};



/**
 * Middleware wrapper for gallery upload with error handling
 */
const uploadGalleryMiddleware = (req, res, next) => {
  uploadGallery(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

const uploadPlacementRecordsMiddleware = (req, res, next) => {
  uploadPlacementRecords(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      // Custom errors (like file type validation)
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    // Success - file uploaded
    next();
  });
};

const deleteFile = (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log("File deleted:", filepath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

module.exports = {
  uploadPassportMiddleware,
  uploadGalleryMiddleware,
  uploadMultipleGallery,
  uploadPlacementRecordsMiddleware,
  deleteFile,
};
