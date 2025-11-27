import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import photoReducer from './slices/photoSlice';
import albumReducer from './slices/albumSlice';
import faceReducer from './slices/faceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    photos: photoReducer,
    albums: albumReducer,
    faces: faceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
