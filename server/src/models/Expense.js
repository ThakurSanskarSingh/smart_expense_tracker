/**
 * @fileoverview Expense Mongoose model definition.
 * Records financial transactions, recurring configuration, and payment details.
 */

import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Expense amount must be greater than zero'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking', 'other'],
      default: 'upi',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    recurring: {
      enabled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly',
      },
      nextDue: {
        type: Date,
        default: null,
      },
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

// Compound index for fast timeline queries and date range filtering
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, 'recurring.enabled': 1, 'recurring.nextDue': 1 });

export const Expense = mongoose.model('Expense', expenseSchema);
