import http from '@/utils/httpHelper';
import { API_ENDPOINTS } from '@/config/apiConfig';

const subscriptionService = {
    getStatus: async () => {
        const data = await http.get(API_ENDPOINTS.SUBSCRIPTION.STATUS);
        return data;
    },

    getTransactions: async () => {
        const data = await http.get(API_ENDPOINTS.SUBSCRIPTION.HISTORY);
        return data;
    },

    createCheckoutSession: async () => {
        const data = await http.post(API_ENDPOINTS.SUBSCRIPTION.SUBSCRIBE);
        return data;
    },
};

export default subscriptionService;