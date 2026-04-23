import { SubscriptionRepository } from '../repositories/subscription.repository.js';

export const SubscriptionInterface = {
    getTotalRevenue: async () => {
        try {
            return await SubscriptionRepository.getTotalRevenue();
        } catch (error) {
            console.error('[SubscriptionInterface] Error getting total revenue:', error);
            return 0; 
        }
    }
};