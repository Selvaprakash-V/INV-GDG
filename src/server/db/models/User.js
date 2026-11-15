import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, LIMITS, EXPIRY, DEFAULT_BUDGET } from '@/shared/constants';
import { AUTH } from '../../config/constants';

const NotificationSettingsSchema = new mongoose.Schema(
  {
    expiryThresholdDays: {
      type: Number,
      min: EXPIRY.MIN_THRESHOLD_DAYS,
      max: EXPIRY.MAX_THRESHOLD_DAYS,
      default: EXPIRY.DEFAULT_THRESHOLD_DAYS,
    },
    emailEnabled: { type: Boolean, default: true },
    dailyDigest: { type: Boolean, default: true },
  },
  { _id: false }
);

const BudgetSchema = new mongoose.Schema(
  {
    monthly: { type: Number, min: 0, default: DEFAULT_BUDGET.monthly },
    weekly: { type: Number, min: 0, default: DEFAULT_BUDGET.weekly },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: LIMITS.FULL_NAME_MAX },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), required: true },
    shopName: {
      type: String,
      trim: true,
      maxlength: LIMITS.SHOP_NAME_MAX,
      required() {
        return this.role === ROLES.ADMIN;
      },
    },
    notificationSettings: { type: NotificationSettingsSchema, default: () => ({}) },
    budget: { type: BudgetSchema, default: () => ({}) },
    /**
     * null = registered but not yet verified. Missing (accounts created before
     * verification existed) is treated as verified, so turning on
     * REQUIRE_EMAIL_VERIFICATION never locks out existing users.
     */
    emailVerifiedAt: { type: Date },
    /** Sessions that signed in before this instant are rejected. */
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, 'notificationSettings.emailEnabled': 1 });

// Hash exactly once, here. (The old test-user route pre-hashed too, producing
// double-hashed passwords that could never log in.)
UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, AUTH.BCRYPT_ROUNDS);
  return next();
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
