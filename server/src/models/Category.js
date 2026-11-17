/**
 * @fileoverview Category Mongoose model definition.
 * Represents predefined system and custom user expense categories.
 */

import mongoose from 'mongoose';

/**
 * Predefined default category templates seeded for every new user.
 */
export const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#EF4444', icon: 'utensils' },
  { name: 'Transport', color: '#F97316', icon: 'car' },
  { name: 'Shopping', color: '#F59E0B', icon: 'shopping-bag' },
  { name: 'Bills', color: '#10B981', icon: 'receipt' },
  { name: 'Rent', color: '#06B6D4', icon: 'home' },
  { name: 'Health', color: '#3B82F6', icon: 'heart-pulse' },
  { name: 'Education', color: '#6366F1', icon: 'graduation-cap' },
  { name: 'Entertainment', color: '#8B5CF6', icon: 'film' },
  { name: 'Travel', color: '#EC4899', icon: 'plane' },
  { name: 'Other', color: '#64748B', icon: 'tag' },
];

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      default: '#3B82F6',
      trim: true,
    },
    icon: {
      type: String,
      default: 'tag',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
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

// Compound unique index on user and category name
categorySchema.index({ user: 1, name: 1 }, { unique: true });

export const Category = mongoose.model('Category', categorySchema);
