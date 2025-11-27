import api from './api';
import { Photo } from './photoService';

export interface Album {
  id: string;
  name: string;
  description?: string;
  photoCount: number;
  coverPhoto?: string;
  isShared: boolean;
  createdAt: string;
}

export interface AlbumDetails extends Album {
  photos: Photo[];
}

export const albumService = {
  async createAlbum(data: { name: string; description?: string }): Promise<{ album: Album }> {
    const response = await api.post<{ message: string; album: Album }>('/albums', data);
    return response.data;
  },

  async getAlbums(): Promise<{ albums: Album[] }> {
    const response = await api.get<{ albums: Album[] }>('/albums');
    return response.data;
  },

  async getAlbum(id: string): Promise<{ album: Album; photos: Photo[] }> {
    const response = await api.get<{ album: Album; photos: Photo[] }>(`/albums/${id}`);
    return response.data;
  },

  async updateAlbum(
    id: string,
    data: { name?: string; description?: string; coverPhotoId?: string; isShared?: boolean }
  ): Promise<{ album: Album }> {
    const response = await api.put<{ message: string; album: Album }>(`/albums/${id}`, data);
    return response.data;
  },

  async deleteAlbum(id: string): Promise<void> {
    await api.delete(`/albums/${id}`);
  },

  async addPhotosToAlbum(albumId: string, photoIds: string[]): Promise<{ photoCount: number }> {
    const response = await api.post<{ message: string; photoCount: number }>(
      `/albums/${albumId}/photos`,
      { photoIds }
    );
    return response.data;
  },

  async removePhotosFromAlbum(albumId: string, photoIds: string[]): Promise<{ photoCount: number }> {
    const response = await api.delete<{ message: string; photoCount: number }>(
      `/albums/${albumId}/photos`,
      { data: { photoIds } }
    );
    return response.data;
  },
};
