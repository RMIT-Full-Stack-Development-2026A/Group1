import { upload } from "../config/multer.config.js";

/**
 * Handles avatar image uploads and catches Multer-specific validation errors.
 * * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object|void} JSON error response or calls next().
 */
export const handleAvatarUpload = (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err) {
            // Catch file size threshold violations
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: "FILE_TOO_LARGE",
                    message: "Avatar upload failed. File is too heavy.",
                    cause: "The uploaded file exceeds the 2MB limit.",
                    valid_example: "Compress your image or choose a file under 2MB."
                });
            }
            
            // Catch invalid file format violations
            if (err.message === 'INVALID_FILE_TYPE' || err.code === 'INVALID_FILE_TYPE') {
                return res.status(400).json({
                    error: "UNSUPPORTED_FILE_TYPE",
                    message: "Avatar upload failed. Unsupported file type.",
                    cause: "Only JPG, PNG, and WEBP formats are supported.",
                    valid_example: "image.jpg, image.png, image.webp"
                });
            }

            // Pass unhandled errors to the global error handler
            return next(err);
        }
        next();
    });
};