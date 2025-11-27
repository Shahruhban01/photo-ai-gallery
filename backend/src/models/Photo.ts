import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPhoto extends Document {
  userId: Types.ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  thumbnailPath?: string;
  width?: number;
  height?: number;
  takenAt?: Date;
  albumId?: Types.ObjectId;
  faces: Types.ObjectId[];
  tags: string[];
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema<IPhoto>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    thumbnailPath: {
      type: String,
      default: null,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    takenAt: {
      type: Date,
      default: null,
    },
    albumId: {
      type: Schema.Types.ObjectId,
      ref: 'Album',
      default: null,
    },
    faces: [{
      type: Schema.Types.ObjectId,
      ref: 'Face',
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
photoSchema.index({ userId: 1, createdAt: -1 });
photoSchema.index({ userId: 1, albumId: 1 });
photoSchema.index({ userId: 1, isDeleted: 1 });
photoSchema.index({ tags: 1 });

export const Photo = mongoose.model<IPhoto>('Photo', photoSchema);
