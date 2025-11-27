import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { photoService, Photo, PhotosResponse } from '../../services';

interface PhotoState {
  photos: Photo[];
  currentPhoto: Photo | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: PhotoState = {
  photos: [],
  currentPhoto: null,
  loading: false,
  uploading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

export const fetchPhotos = createAsyncThunk(
  'photos/fetchPhotos',
  async (params: { page?: number; limit?: number; albumId?: string; favorite?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await photoService.getPhotos(params);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch photos');
    }
  }
);

export const fetchPhoto = createAsyncThunk(
  'photos/fetchPhoto',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await photoService.getPhoto(id);
      return response.photo;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch photo');
    }
  }
);

export const uploadPhotos = createAsyncThunk(
  'photos/uploadPhotos',
  async ({ files, albumId }: { files: File[]; albumId?: string }, { rejectWithValue }) => {
    try {
      const response = await photoService.uploadPhotos(files, albumId);
      return response.photos;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to upload photos');
    }
  }
);

export const updatePhoto = createAsyncThunk(
  'photos/updatePhoto',
  async (
    { id, data }: { id: string; data: { isFavorite?: boolean; tags?: string[]; albumId?: string | null } },
    { rejectWithValue }
  ) => {
    try {
      const response = await photoService.updatePhoto(id, data);
      return response.photo;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update photo');
    }
  }
);

export const deletePhoto = createAsyncThunk(
  'photos/deletePhoto',
  async (id: string, { rejectWithValue }) => {
    try {
      await photoService.deletePhoto(id);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete photo');
    }
  }
);

export const searchPhotos = createAsyncThunk(
  'photos/searchPhotos',
  async (
    params: { query?: string; personId?: string; startDate?: string; endDate?: string; albumId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await photoService.searchPhotos(params);
      return response.photos;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to search photos');
    }
  }
);

const photoSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    clearPhotos: (state) => {
      state.photos = [];
      state.pagination = initialState.pagination;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Photos
      .addCase(fetchPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.photos = action.payload.photos;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Single Photo
      .addCase(fetchPhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPhoto = action.payload;
      })
      .addCase(fetchPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload Photos
      .addCase(uploadPhotos.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadPhotos.fulfilled, (state, action) => {
        state.uploading = false;
        state.photos = [...action.payload, ...state.photos];
      })
      .addCase(uploadPhotos.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })
      // Update Photo
      .addCase(updatePhoto.fulfilled, (state, action) => {
        const index = state.photos.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.photos[index] = { ...state.photos[index], ...action.payload };
        }
        if (state.currentPhoto?.id === action.payload.id) {
          state.currentPhoto = { ...state.currentPhoto, ...action.payload };
        }
      })
      // Delete Photo
      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.photos = state.photos.filter((p) => p.id !== action.payload);
        if (state.currentPhoto?.id === action.payload) {
          state.currentPhoto = null;
        }
      })
      // Search Photos
      .addCase(searchPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.photos = action.payload;
      })
      .addCase(searchPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPhotos, clearError } = photoSlice.actions;
export default photoSlice.reducer;
