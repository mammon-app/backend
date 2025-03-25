import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  primaryEmail: string;
  secondaryEmail: string;
  pinCode: string;
  password: string;
  country: string;
  userProfileUrl?: string;
  username: string;
  stellarPublicKey: string;
  isCaptchaVerified: boolean;
  isEmailVerified: boolean;
  isSuspended: boolean;
  currency: string;
  totalWalletBalance: number;
  encryptedPrivateKey: string;
  spendableBalance: number;
  savingsBalance: number;
  referralCode: string;
  role: string[];
  points: number;
  createdAt: Date;
  updatedAt: Date;
}
