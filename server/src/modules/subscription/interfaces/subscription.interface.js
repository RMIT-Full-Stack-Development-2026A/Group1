import { SubscriptionRepository } from '../repositories/subscription.repository.js';

export const SubscriptionInterface = {
    getTotalRevenue: async () => SubscriptionRepository.getTotalRevenue(),
};