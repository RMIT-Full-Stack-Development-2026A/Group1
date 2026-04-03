// import { SubscriptionService } from "../services/subscription.service.js";
import { SubscriptionDTO } from "../dtos/subscription.dto.js";

// Interface exposes subscription status and purchase flows to controllers or sibling modules.
export const SubscriptionInterface = {
    getSubscriptionStatus: async (userId) => {
        // const result = await SubscriptionService.getSubscriptionStatus(userId);
        // return SubscriptionDTO.toStatus(result);
    },

    purchaseSubscription: async (userId, payload) => {
        // const result = await SubscriptionService.purchaseSubscription(userId, payload);
        // return SubscriptionDTO.toPurchaseResponse(result);
    },

    getSubscriptionHistory: async (userId, query) => {
        // const result = await SubscriptionService.getSubscriptionHistory(userId, query);
        // return SubscriptionDTO.toHistory(result.items, result.pagination);
    }
};