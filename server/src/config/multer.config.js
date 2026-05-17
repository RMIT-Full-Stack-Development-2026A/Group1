import multer from 'multer';

// Store files in a memory buffer
const storage = multer.memoryStorage();

/**
 * Validates the uploaded file's MIME type against allowed image formats.
 * * @param {Object} req - The Express request object.
 * @param {Object} file - The uploaded file object.
 * @param {Function} cb - The Multer callback function to signal success or failure.
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb({ code: 'INVALID_FILE_TYPE', message: 'Only JPG, PNG and WEBP are allowed' }, false);
    }
};

// Export the Multer instance
export const upload = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: 2 * 1024 * 1024  // 2MB limit
    } 
});