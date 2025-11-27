import api from './api';

export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  thumbnailUrl: string;
  url: string;
  width?: number;
  height?: number;
  isFavorite: boolean;
  faceCount?: number;
  tags: string[];
  createdAt: string;
}

export interface PhotoDetails extends Photo {
  size: number;
  mimeType: string;
  albumId?: string;
  faces: Array<{
    id: string;
    boundingBox: { x: number; y: number; width: number; height: number };
    personId?: string;
  }>;
}

export interface PhotosResponse {
  photos: Photo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const photoService = {
  async uploadPhotos(files: File[], albumId?: string): Promise<{ photos: Photo[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });
    if (albumId) {
      formData.append('albumId', albumId);
    }

    const response = await api.post<{ message: string; photos: Photo[] }>(
      '/photos/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async getPhotos(params?: {
    page?: number;
    limit?: number;
    albumId?: string;
    favorite?: boolean;
  }): Promise<PhotosResponse> {
    const response = await api.get<PhotosResponse>('/photos', { params });
    return response.data;
  },

  async getPhoto(id: string): Promise<{ photo: PhotoDetails }> {
    const response = await api.get<{ photo: PhotoDetails }>(`/photos/${id}`);
    return response.data;
  },

  async updatePhoto(
    id: string,
    data: { isFavorite?: boolean; tags?: string[]; albumId?: string | null }
  ): Promise<{ photo: Photo }> {
    const response = await api.put<{ message: string; photo: Photo }>(
      `/photos/${id}`,
      data
    );
    return response.data;
  },

  async deletePhoto(id: string): Promise<void> {
    await api.delete(`/photos/${id}`);
  },

  async searchPhotos(params: {
    query?: string;
    personId?: string;
    startDate?: string;
    endDate?: string;
    albumId?: string;
  }): Promise<{ photos: Photo[] }> {
    const response = await api.get<{ photos: Photo[] }>('/photos/search', { params });
    return response.data;
  },

  getImageUrl(photoId: string): string {
    const token = localStorage.getItem('token');
    return `${api.defaults.baseURL}/photos/${photoId}/image?token=${token}`;
  },

  getThumbnailUrl(photoId: string): string {
    const token = localStorage.getItem('token');
    return `${api.defaults.baseURL}/photos/${photoId}/thumbnail?token=${token}`;
  },
};
