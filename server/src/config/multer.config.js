import multer from 'multer';

// Use memory storage to pass buffer directly to Sharp
const storage = multer.memoryStorage();

// Validate file type
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb({ code: 'INVALID_FILE_TYPE', message: 'Only JPG, PNG and WEBP are allowed' }, false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: 2 * 1024 * 1024 // 2MB max file size
    } 
});