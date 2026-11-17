/**
 * @fileoverview Budget Mongoose model definition.
 * Sets monthly expenditure limits globally or per category with warning thresholds.
 */

import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // null represents overall monthly budget limit
    },
    month: {
      type: String, // Format: YYYY-MM
      required: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
      index: true,
    },
    limit: {
      type: Number,
      required: true,
      min: [1, 'Budget limit must be at least 1'],
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: [1, 'Alert threshold must be at least 1%'],
      max: [100, 'Alert threshold cannot exceed 100%'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound unique index ensuring one budget per user/category/month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

export const Budget = mongoose.model('Budget', budgetSchema);
