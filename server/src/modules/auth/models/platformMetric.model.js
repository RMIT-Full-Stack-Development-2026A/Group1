import mongoose from 'mongoose';

// A Singleton schema to hold running tallies
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
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export const Revenue = mongoose.model('revenue', platformMetricSchema, 'revenue');