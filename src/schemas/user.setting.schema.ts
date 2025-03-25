import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

/**
 * Enumeration for different screen preference modes.
 */
enum MODES {
  LIGHT = "light",
  DARK = "dark",
  AUTO = "auto",
}

/**
 * UserSetting class represents the settings configuration for a user.
 */
@Schema()
export class UserSetting {
  /**
   * Reference to the User object. Each setting is associated with a specific user.
   * The `required` property ensures that this field must be provided.
   */
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId;

  /**
   * Indicates whether product announcements are enabled. Default is true.
   */
  @Prop({ default: true })
  productAnnoucement: boolean;

  /**
   * Indicates whether account activity notifications are enabled. Default is true.
   */
  @Prop({ default: true })
  accountActivity: boolean;

  /**
   * Indicates whether message notifications are enabled. Default is true.
   */
  @Prop({ default: true })
  messages: boolean;

  /**
   * Indicates whether insights and tips notifications are enabled. Default is true.
   */
  @Prop({ default: true })
  insightsTips: boolean;

  /**
   * Indicates whether network fee alerts are enabled. Default is true.
   */
  @Prop({ default: true })
  networkFeeAlert: boolean;

  /**
   * Specifies the screen preference mode for the user. Default is LIGHT mode.
   * The `enum` property restricts the value to the defined modes in the MODES enum.
   */
  @Prop({ default: MODES.LIGHT, enum: Object.values(MODES) })
  screenPreference: string;
}

/**
 * SchemaFactory creates a Mongoose schema for the UserSetting class.
 */
export const UserSettingSchema = SchemaFactory.createForClass(UserSetting);
