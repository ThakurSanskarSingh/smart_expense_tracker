/**
 * @fileoverview User Mongoose model definition.
 * Represents an authenticated user profile synchronized with Firebase Auth.
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
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

export const User = mongoose.model('User', userSchema);
