import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAlbum extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  coverPhotoId?: Types.ObjectId;
  photoCount: number;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const albumSchema = new Schema<IAlbum>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Album name is required'],
      trim: true,
      maxlength: [100, 'Album name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    coverPhotoId: {
      type: Schema.Types.ObjectId,
      ref: 'Photo',
      default: null,
    },
    photoCount: {
      type: Number,
      default: 0,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

albumSchema.index({ userId: 1, name: 1 });

export const Album = mongoose.model<IAlbum>('Album', albumSchema);
