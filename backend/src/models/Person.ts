import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPerson extends Document {
  userId: Types.ObjectId;
  name: string;
  representativeFaceId?: Types.ObjectId;
  faceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const personSchema = new Schema<IPerson>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    representativeFaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Face',
      default: null,
    },
    faceCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

personSchema.index({ userId: 1, name: 1 });

export const Person = mongoose.model<IPerson>('Person', personSchema);
