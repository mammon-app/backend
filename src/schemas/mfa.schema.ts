import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class MFA {
  /**
   * The secret key for multi-factor authentication (MFA).
   * This field is required.
   */
  @Prop({ required: true })
  secret: string;

  /**
   * A boolean flag indicating whether MFA is enabled for the user.
   * Default value is false.
   */
  @Prop({ default: false })
  isEnabled: boolean;

  /**
   * A boolean flag indicating whether email-based MFA is enabled.
   * Default value is false.
   */
  @Prop({ default: false })
  isEmail: boolean;

  /**
   * A boolean flag indicating whether MFA setup is complete.
   * Default value is false.
   */
  @Prop({ default: false })
  isSetup: boolean;

  /**
   * A reference to the User document associated with this MFA.
   * This field is required and references the User schema.
   */
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId;

  /**
   * The date and time when the MFA was created.
   * Default value is the current date and time.
   * This field is required.
   */
  @Prop({ default: Date.now, required: true })
  createdAt: Date;

  /**
   * The date and time when the MFA was last updated.
   * Default value is the current date and time.
   * This field is required.
   */
  @Prop({ default: Date.now, required: true })
  updatedAt: Date;
}

/**
 * Schema definition for the MFA class.
 * Creates a Mongoose schema for the MFA class.
 */
export const MFASchema = SchemaFactory.createForClass(MFA);
