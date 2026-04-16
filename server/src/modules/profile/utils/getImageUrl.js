export const getPublicIdFromUrl = (url) => {
    try {
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567/avatars/user-123-456.webp
        const parts = url.split('/');
        const fileNameWithExt = parts.pop(); // "user-123-456.webp"
        const folder = parts.pop(); // "avatars"
        const publicId = fileNameWithExt.split('.')[0]; // "user-123-456"
        
        return `${folder}/${publicId}`;
    } catch (error) {
        return null;
    }
};