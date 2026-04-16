import http from '@/utils/httpHelper';
import { API_ENDPOINTS } from '@/config/apiConfig';

const subscriptionService = {
    /**
     * Lấy thông tin ví và trạng thái premium của user hiện tại.
     * @returns {{ walletBalance: number, isPremium: boolean }}
     */
    getWalletStatus: async () => {
        const data = await http.get(API_ENDPOINTS.SUBSCRIPTION.STATUS);
        return data;
    },

    /**
     * Lấy lịch sử giao dịch của user hiện tại.
     * @returns {Array<{ id, date, amount, type, status, isDebit }>}
     */
    getTransactions: async () => {
        const data = await http.get(API_ENDPOINTS.WALLET.TRANSACTIONS);
        return data;
    },

    /**
     * Nạp tiền vào ví.
     * @param {number} amount
     * @returns {{ walletBalance: number }}
     */
    deposit: async (amount) => {
        const data = await http.post(API_ENDPOINTS.WALLET.DEPOSIT, { amount });
        return data;
    },

    /**
     * Kích hoạt gói Premium bằng số dư ví.
     * @returns {{ isPremium: boolean, premiumExpiresAt: string }}
     */
    subscribe: async () => {
        const data = await http.post(API_ENDPOINTS.SUBSCRIPTION.SUBSCRIBE);
        return data;
    },
};

export default subscriptionService;