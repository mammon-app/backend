import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "./user.schema";

@Schema()
export class TransactionHistory extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name })
  user: User;

  @Prop({ required: true })
  txHash: string;

  @Prop({ required: true })
  transactionDetail: Map<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now})
  updatedAt: Date;
}

export const TransactionHistorySchema =
  SchemaFactory.createForClass(TransactionHistory);
