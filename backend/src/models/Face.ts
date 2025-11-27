import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFace extends Document {
  userId: Types.ObjectId;
  photoId: Types.ObjectId;
  personId?: Types.ObjectId;
  descriptor: number[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  thumbnailPath?: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

const faceSchema = new Schema<IFace>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    photoId: {
      type: Schema.Types.ObjectId,
      ref: 'Photo',
      required: true,
      index: true,
    },
    personId: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      default: null,
      index: true,
    },
    descriptor: {
      type: [Number],
      required: true,
    },
    boundingBox: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    thumbnailPath: {
      type: String,
      default: null,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
  }
);

faceSchema.index({ userId: 1, personId: 1 });

export const Face = mongoose.model<IFace>('Face', faceSchema);
