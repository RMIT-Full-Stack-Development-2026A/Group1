export const baseSchemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        /**
         * Formats the document for API responses.
         * @param {Object} _doc - The original Mongoose document.
         * @param {Object} ret - The plain object representation.
         * @returns {Object} Formatted object.
         */
        transform: function (_doc, ret) {
            ret.id = ret._id; // Map _id to id
            delete ret._id;   // Remove raw _id
            return ret;
        }
    }
};