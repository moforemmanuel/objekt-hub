import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ObjectDocument = HydratedDocument<ObjectEntity>;

@Schema({ timestamps: true })
export class ObjectEntity {
  @Prop({ required: true, maxlength: 100, trim: true })
  title: string;

  @Prop({ maxlength: 500, trim: true })
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ObjectSchema = SchemaFactory.createForClass(ObjectEntity);

// Indexes
ObjectSchema.index({ title: 'text', description: 'text' });
ObjectSchema.index({ createdAt: -1 });
ObjectSchema.index({ createdBy: 1 });
