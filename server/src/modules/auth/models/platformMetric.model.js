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
});

export const PlatformMetric = mongoose.model('PlatformMetric', platformMetricSchema);