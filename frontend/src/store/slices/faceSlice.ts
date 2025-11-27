import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { faceService, Person } from '../../services';
import { Photo } from '../../services/photoService';

interface FaceState {
  persons: Person[];
  currentPerson: Person | null;
  currentPersonPhotos: Photo[];
  loading: boolean;
  clustering: boolean;
  error: string | null;
}

const initialState: FaceState = {
  persons: [],
  currentPerson: null,
  currentPersonPhotos: [],
  loading: false,
  clustering: false,
  error: null,
};

export const fetchPersons = createAsyncThunk(
  'faces/fetchPersons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await faceService.getPersons();
      return response.persons;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch persons');
    }
  }
);

export const fetchPerson = createAsyncThunk(
  'faces/fetchPerson',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await faceService.getPerson(id);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch person');
    }
  }
);

export const updatePerson = createAsyncThunk(
  'faces/updatePerson',
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await faceService.updatePerson(id, name);
      return response.person;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update person');
    }
  }
);

export const clusterFaces = createAsyncThunk(
  'faces/clusterFaces',
  async (_, { rejectWithValue }) => {
    try {
      const response = await faceService.clusterFaces();
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to cluster faces');
    }
  }
);

const faceSlice = createSlice({
  name: 'faces',
  initialState,
  reducers: {
    clearCurrentPerson: (state) => {
      state.currentPerson = null;
      state.currentPersonPhotos = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Persons
      .addCase(fetchPersons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersons.fulfilled, (state, action) => {
        state.loading = false;
        state.persons = action.payload;
      })
      .addCase(fetchPersons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Single Person
      .addCase(fetchPerson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPerson = action.payload.person;
        state.currentPersonPhotos = action.payload.photos;
      })
      .addCase(fetchPerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Person
      .addCase(updatePerson.fulfilled, (state, action) => {
        const index = state.persons.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.persons[index] = { ...state.persons[index], ...action.payload };
        }
        if (state.currentPerson?.id === action.payload.id) {
          state.currentPerson = { ...state.currentPerson, ...action.payload };
        }
      })
      // Cluster Faces
      .addCase(clusterFaces.pending, (state) => {
        state.clustering = true;
        state.error = null;
      })
      .addCase(clusterFaces.fulfilled, (state) => {
        state.clustering = false;
      })
      .addCase(clusterFaces.rejected, (state, action) => {
        state.clustering = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentPerson, clearError } = faceSlice.actions;
export default faceSlice.reducer;
