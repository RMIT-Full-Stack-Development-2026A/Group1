import mongoose from 'mongoose';

// A Singleton schema 
const platformMetricSchema = new mongoose.Schema({
    singletonId: { 
        type: String, 
        default: 'GLOBAL_METRICS', 
        unique: true, 
        index: true 
    },
    totalRevenue: { 
        type: Number, 
        default: 0 
    }
}, {
    timestamps: true,
    toJSON: {
        /**
         * Formats document for responses.
         * @param {Object} _doc - Raw document.
         * @param {Object} ret - Plain object.
         * @returns {Object}
         */
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export const Revenue = mongoose.model('revenue', platformMetricSchema, 'revenue');