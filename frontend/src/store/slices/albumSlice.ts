import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { albumService, Album } from '../../services';
import { Photo } from '../../services/photoService';

interface AlbumState {
  albums: Album[];
  currentAlbum: Album | null;
  currentAlbumPhotos: Photo[];
  loading: boolean;
  error: string | null;
}

const initialState: AlbumState = {
  albums: [],
  currentAlbum: null,
  currentAlbumPhotos: [],
  loading: false,
  error: null,
};

export const fetchAlbums = createAsyncThunk(
  'albums/fetchAlbums',
  async (_, { rejectWithValue }) => {
    try {
      const response = await albumService.getAlbums();
      return response.albums;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch albums');
    }
  }
);

export const fetchAlbum = createAsyncThunk(
  'albums/fetchAlbum',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await albumService.getAlbum(id);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch album');
    }
  }
);

export const createAlbum = createAsyncThunk(
  'albums/createAlbum',
  async (data: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await albumService.createAlbum(data);
      return response.album;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create album');
    }
  }
);

export const updateAlbum = createAsyncThunk(
  'albums/updateAlbum',
  async (
    { id, data }: { id: string; data: { name?: string; description?: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await albumService.updateAlbum(id, data);
      return response.album;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update album');
    }
  }
);

export const deleteAlbum = createAsyncThunk(
  'albums/deleteAlbum',
  async (id: string, { rejectWithValue }) => {
    try {
      await albumService.deleteAlbum(id);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete album');
    }
  }
);

const albumSlice = createSlice({
  name: 'albums',
  initialState,
  reducers: {
    clearCurrentAlbum: (state) => {
      state.currentAlbum = null;
      state.currentAlbumPhotos = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Albums
      .addCase(fetchAlbums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlbums.fulfilled, (state, action) => {
        state.loading = false;
        state.albums = action.payload;
      })
      .addCase(fetchAlbums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Single Album
      .addCase(fetchAlbum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlbum.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAlbum = action.payload.album;
        state.currentAlbumPhotos = action.payload.photos;
      })
      .addCase(fetchAlbum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Album
      .addCase(createAlbum.fulfilled, (state, action) => {
        state.albums = [action.payload, ...state.albums];
      })
      // Update Album
      .addCase(updateAlbum.fulfilled, (state, action) => {
        const index = state.albums.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.albums[index] = { ...state.albums[index], ...action.payload };
        }
        if (state.currentAlbum?.id === action.payload.id) {
          state.currentAlbum = { ...state.currentAlbum, ...action.payload };
        }
      })
      // Delete Album
      .addCase(deleteAlbum.fulfilled, (state, action) => {
        state.albums = state.albums.filter((a) => a.id !== action.payload);
        if (state.currentAlbum?.id === action.payload) {
          state.currentAlbum = null;
          state.currentAlbumPhotos = [];
        }
      });
  },
});

export const { clearCurrentAlbum, clearError } = albumSlice.actions;
export default albumSlice.reducer;
