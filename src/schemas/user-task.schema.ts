import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class UserTask extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'Task' })
  task: Types.ObjectId;

  @Prop({ default: false, required: true })
  is_completed: boolean;

  @Prop({ default: Date.now, required: true }) // Defines a default date property set to current timestamp
  createdAt: Date;

  @Prop({ default: Date.now, required: true }) // Defines a default date property set to current timestamp
  updatedAt: Date;
}

export const UserTaskSchema = SchemaFactory.createForClass(UserTask);
