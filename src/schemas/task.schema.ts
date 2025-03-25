import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Task extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  xp: number;

  @Prop({ required: true, default: "/" })
  url: string;

  @Prop({ default: Date.now, required: true }) // Defines a default date property set to current timestamp
  createdAt: Date;

  @Prop({ default: Date.now, required: true }) // Defines a default date property set to current timestamp
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
