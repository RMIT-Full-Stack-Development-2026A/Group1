export const baseSchemaOptions = {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
        virtuals: true, // Include virtual fields like isPremium
        versionKey: false, // Remove __v from API responses
        transform: function (_doc, ret) {
        ret.id = ret._id; // Expose Mongo _id as id for frontend consistency
        delete ret._id; // Hide raw Mongo field
        return ret;
        }
    }
};