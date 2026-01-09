exports.sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

exports.sendError = (res, message, data = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data
  });
};

/**
 * Standardized API Response Utilities
 * Provides consistent response format across all endpoints
 */

// class ApiResponse {
//   /**
//    * Success response
//    * @param {Object} res - Express response object
//    * @param {*} data - Response data
//    * @param {String} message - Success message
//    * @param {Number} statusCode - HTTP status code
//    */
//   static success(res, data = null, message = "Success", statusCode = 200) {
//     return res.status(statusCode).json({
//       success: true,
//       message,
//       data,
//     });
//   }

//   /**
//    * Error response
//    * @param {Object} res - Express response object
//    * @param {String} message - Error message
//    * @param {Number} statusCode - HTTP status code
//    * @param {*} errors - Validation errors or additional error details
//    */
//   static error(
//     res,
//     message = "Something went wrong",
//     statusCode = 500,
//     errors = null
//   ) {
//     const response = {
//       success: false,
//       message,
//     };

//     if (errors) {
//       response.errors = errors;
//     }

//     return res.status(statusCode).json(response);
//   }

//   /**
//    * Validation error response
//    * @param {Object} res - Express response object
//    * @param {Array} errors - Array of validation errors
//    */
//   static validationError(res, errors) {
//     return res.status(400).json({
//       success: false,
//       message: "Validation failed",
//       errors,
//     });
//   }

//   /**
//    * Unauthorized response
//    * @param {Object} res - Express response object
//    * @param {String} message - Error message
//    */
//   static unauthorized(res, message = "Unauthorized access") {
//     return res.status(401).json({
//       success: false,
//       message,
//     });
//   }

//   /**
//    * Forbidden response
//    * @param {Object} res - Express response object
//    * @param {String} message - Error message
//    */
//   static forbidden(res, message = "Access forbidden") {
//     return res.status(403).json({
//       success: false,
//       message,
//     });
//   }

//   /**
//    * Not found response
//    * @param {Object} res - Express response object
//    * @param {String} message - Error message
//    */
//   static notFound(res, message = "Resource not found") {
//     return res.status(404).json({
//       success: false,
//       message,
//     });
//   }

//   /**
//    * Created response
//    * @param {Object} res - Express response object
//    * @param {*} data - Created resource data
//    * @param {String} message - Success message
//    */
//   static created(res, data, message = "Resource created successfully") {
//     return res.status(201).json({
//       success: true,
//       message,
//       data,
//     });
//   }

//   /**
//    * Paginated response
//    * @param {Object} res - Express response object
//    * @param {Array} data - Array of items
//    * @param {Number} page - Current page
//    * @param {Number} limit - Items per page
//    * @param {Number} total - Total items count
//    * @param {String} message - Success message
//    */
//   static paginated(res, data, page, limit, total, message = "Success") {
//     const totalPages = Math.ceil(total / limit);

//     return res.status(200).json({
//       success: true,
//       message,
//       data,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages,
//         totalItems: total,
//         itemsPerPage: parseInt(limit),
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//       },
//     });
//   }
// }

// module.exports = ApiResponse;
