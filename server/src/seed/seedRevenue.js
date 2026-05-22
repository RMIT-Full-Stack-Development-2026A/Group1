import { Revenue } from '../modules/auth/models/platformMetric.model.js'; 

/**
 * Seeds the global platform revenue metric.
 * @returns {Promise<void>}
 */
export const seedRevenue = async () => {
    

    // Setting a base revenue amount
    const metric = await Revenue.findOneAndUpdate(
        { singletonId: 'GLOBAL_METRICS' },
        { $set: { totalRevenue: 10.00 } }, 
        { upsert: true, new: true }
    );

    
};