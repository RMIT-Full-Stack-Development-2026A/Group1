import express from "express";

const walletRoutes = express.Router();

/**
 * @openapi
 * /api/v1/wallet:
 *   get:
 *     tags: [Wallet]
 *     summary: Current balance + recent transactions
 *     responses:
 *       200:
 *         $ref: '#/components/responses/WalletResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
// walletRoutes.get('/');

/**
 * @openapi
 * /api/v1/wallet/deposit:
 *   post:
 *     tags: [Wallet]
 *     summary: Deposit funds into wallet
 *     requestBody:
 *       $ref: '#/components/requestBodies/DepositBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/WalletResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
// walletRoutes.post('/deposit');

/**
 * @openapi
 * /api/v1/wallet/transactions:
 *   get:
 *     tags: [Wallet]
 *     summary: Paginated transaction history
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/DateFromParam'
 *       - $ref: '#/components/parameters/DateToParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/TransactionListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
// walletRoutes.get('/transactions')