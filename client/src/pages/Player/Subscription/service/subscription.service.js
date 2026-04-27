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

    createOrder: async () => {
        const data = await http.post(API_ENDPOINTS.SUBSCRIPTION.CREATE_ORDER);
        return data;
    },

    captureOrder: async (orderId) => {
        const data = await http.post(API_ENDPOINTS.SUBSCRIPTION.CAPTURE_ORDER, { orderId });
        return data;
    },
};

export default subscriptionService;