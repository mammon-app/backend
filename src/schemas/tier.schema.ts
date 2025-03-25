import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Tier extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  minXp: number;

  @Prop({ required: true })
  maxXp: number;

  @Prop({ default: Date.now, required: true }) // Defines a default date property set to current timestamp
  createdAt: Date;

  @Prop({ default: Date.now, required: true }) // Defines a default date property set to current timestamp
  updatedAt: Date;
}

export const TierSchema = SchemaFactory.createForClass(Tier);
