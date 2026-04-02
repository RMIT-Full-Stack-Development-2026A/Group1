import mongoose from 'mongoose';
import { baseSchemaOptions } from '../../../utils/baseSchemaOptions';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // User who owns this transaction
    ref: 'User', // Links transaction to account
    required: true, // Every transaction must belong to a user
    index: true // Speeds up user transaction history queries
  },

  type: {
    type: String, // Business category of transaction
    enum: ['DEPOSIT', 'SUBSCRIPTION'], // Supported transaction types
    required: true, // Required for history and logic branching
    index: true // Useful for filtering deposits vs subscriptions
  },

  provider: {
    type: String, // Payment source/provider used for this transaction
    enum: ['LOCAL_WALLET', 'STRIPE', 'PAYPAL'], // Supported providers in current design
    required: true, // Each transaction must say where it came from
    default: 'LOCAL_WALLET' // Default if handled internally
  },

  amount: {
    type: Number, // Money amount for this transaction
    required: true, // Transaction must have value
    min: 0 // Prevent negative stored amount
  },

  currency: {
    type: String, // Currency code for financial clarity
    default: 'USD' // Default currency in this project
  },

  status: {
    type: String, // Processing outcome of the transaction
    enum: ['PENDING', 'SUCCESS', 'FAILED'], // Supported payment statuses
    required: true, // Every transaction must have a final/working state
    default: 'SUCCESS', // Internal/local actions may succeed immediately
    index: true // Useful for filtering failed/pending transactions
  },

  externalTransactionId: {
    type: String, // ID from Stripe/PayPal/other provider if one exists
    default: null, // Null if not applicable
    index: true, // Useful for reconciliation and payment tracing
    sparse: true // Only index documents that actually have this field
  },

  balanceBefore: {
    type: Number, // Wallet balance before applying this transaction
    default: 0 // Useful for audit trail
  },

  balanceAfter: {
    type: Number, // Wallet balance after applying this transaction
    default: 0 // Useful for audit trail and debugging
  },

  subscriptionPeriodStart: {
    type: Date, // Start date of premium period for subscription transactions
    default: null // Null for deposit transactions
  },

  subscriptionPeriodEnd: {
    type: Date, // End date of premium period for subscription transactions
    default: null, // Null for deposit transactions
    index: true // Useful for subscription history and expiry analysis
  },

  metadata: {
    type: mongoose.Schema.Types.Mixed, // Extra provider-specific details if needed
    default: {} // Empty object when no extra data is needed
  }
}, baseSchemaOptions);

transactionSchema.index({ userId: 1, createdAt: -1 }); // Fast latest-transactions lookup per user
transactionSchema.index({ userId: 1, type: 1, createdAt: -1 }); // Fast filtered history by user and transaction type

export const Transaction = mongoose.model('Transaction', transactionSchema);