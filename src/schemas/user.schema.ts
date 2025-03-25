import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserRole } from "src/common/enum";
import { CurrencyEnum } from "src/common/enum/currency.enum"; // Importing currency enumeration

/**
 * Mongoose schema representing user data in the application.
 * This schema defines the structure and validation rules for user documents.
 */
@Schema()
export class User {
  @Prop({ trim: true }) // Defines a trimmed secondary email property
  secondaryEmail: string;

  @Prop({ unique: true, required: true, trim: true }) // Defines a unique and required primary email property
  primaryEmail: string;


  @Prop() // Defines a password property
  password: string;

  @Prop({ required: true, default: true }) // Defines a isPassword property
  isPassword: boolean;

  @Prop() // Defines a PIN code property
  pinCode: string;

  @Prop() // Defines an optional user profile URL property
  userProfileUrl?: string;

  @Prop({
    required: true,
    default: UserRole.USER,
  })
  role: string[];

  @Prop() // Defines an optional user profile URL property
  country?: string;

  @Prop()
  xp?: number;

  @Prop({ unique: true, required: true, trim: true }) // Defines a unique and required username property
  username: string;

  @Prop() // Defines an optional stellar public key property
  stellarPublicKey?: string;

  @Prop({ default: false, required: true }) // Defines a default false and required isEmailVerified property
  isEmailVerified: boolean;

  @Prop({ default: false, required: true }) // Defines a default false and required isSuspended property
  isSuspended: boolean;

  @Prop({ default: false, required: false }) // Defines a default false and required isCaptchaVerified property
  isCaptchaVerified: boolean;

  @Prop({
    default: CurrencyEnum.NGN, // Sets default currency to NGN (Nigerian Naira)
    enum: Object.values(CurrencyEnum), // Validates against values in CurrencyEnum
    required: true,
  })
  currency: CurrencyEnum; // Defines currency property with enumerated type CurrencyEnum

  @Prop({ type: Number, default: 0 }) // Defines a numeric type property with default value 0
  totalWalletBalance: number;

  @Prop({ type: String }) // Defines a string type property for encrypted private key
  encryptedPrivateKey?: string;

  @Prop({ type: Number, default: 0 }) // Defines a numeric type property with default value 0
  spendableBalance: number;

  @Prop({ type: Number, default: 0 }) // Defines a numeric type property with default value 0
  savingsBalance: number;

  @Prop({ type: String, unique: true, required: true }) // Defines a unique and required referral code property
  referralCode: string;

  @Prop({ type: Number, default: 0 }) // Defines a numeric type property with default value 0
  points: number;

  @Prop({ default: Date.now, required: true }) // Defines a default date property set to current timestamp
  createdAt: Date;

  @Prop({ default: Date.now, required: true }) // Defines a default date property set to current timestamp
  updatedAt: Date;
}

// Generates and exports the Mongoose schema based on the User class
export const UserSchema = SchemaFactory.createForClass(User);
