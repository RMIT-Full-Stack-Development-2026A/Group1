/**
 * Extracts the Cloudinary folder and public ID from a full image URL.
 * @param {string} url - The full Cloudinary image URL.
 * @returns {string|null} The path relative to the bucket, or null if parsing fails.
 */
export const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split('/');
        const fileNameWithExt = parts.pop();
        const folder = parts.pop();
        const publicId = fileNameWithExt.split('.')[0];
        
        return `${folder}/${publicId}`;
    } catch (error) {
        return null;
    }
};