// import { WalletService } from "../services/wallet.service.js";
import { WalletDTO } from "../dtos/wallet.dto.js";

// Interface exposes wallet summary and transaction flows to other modules.
export const WalletInterface = {
    getWalletSummary: async (userId) => {
        // const result = await WalletService.getWalletSummary(userId);
        // return WalletDTO.toWalletSummary(result);
    },

    createDeposit: async (userId, payload) => {
        // const transaction = await WalletService.createDeposit(userId, payload);
        // return WalletDTO.toTransactionItem(transaction);
    },

    getTransactionHistory: async (userId, query) => {
        // const result = await WalletService.getTransactionHistory(userId, query);
        // return WalletDTO.toTransactionHistory(result.items, result.pagination);
    },

    getRecentTransactions: async (userId, limit = 5) => {
        // const transactions = await WalletService.getRecentTransactions(userId, limit);
        // return Array.isArray(transactions)
        //     ? transactions.map((transaction) => WalletDTO.toTransactionItem(transaction))
        //     : [];
    },

    getCurrentBalance: async (userId) => {
        // const result = await WalletService.getWalletSummary(userId);
        // return result?.balance ?? 0;
    }
};