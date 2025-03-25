import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "./user.schema";

@Schema()
export class Referral extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  referredBy: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  referredUser: User | Types.ObjectId;

  @Prop({ required: true })
  xp: number;

  @Prop({ default: Date.now, required: true }) // Defines a default date property set to current timestamp
  createdAt: Date;

  @Prop({ default: Date.now, required: true }) // Defines a default date property set to current timestamp
  updatedAt: Date;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
