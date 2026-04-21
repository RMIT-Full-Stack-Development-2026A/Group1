import { upload } from "../config/multer.config.js";

export const handleAvatarUpload = (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: "FILE_TOO_LARGE",
                    message: "Avatar upload failed. File is too heavy.",
                    cause: "The uploaded file exceeds the 2MB limit.",
                    valid_example: "Compress your image or choose a file under 2MB."
                });
            }
            // Catch custom file type errors from Multer fileFilter
            if (err.message === 'INVALID_FILE_TYPE' || err.code === 'INVALID_FILE_TYPE') {
                return res.status(400).json({
                    error: "UNSUPPORTED_FILE_TYPE",
                    message: "Avatar upload failed. Unsupported file type.",
                    cause: "Only JPG, PNG, and WEBP formats are supported.",
                    valid_example: "image.jpg, image.png, image.webp"
                });
            }
            return next(err);
        }
        next();
    });
};