import api from './api';
import { Photo } from './photoService';

export interface Person {
  id: string;
  name: string;
  faceCount: number;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface PersonDetails extends Person {
  photos: Photo[];
}

export const faceService = {
  async getPersons(): Promise<{ persons: Person[] }> {
    const response = await api.get<{ persons: Person[] }>('/faces/persons');
    return response.data;
  },

  async getPerson(id: string): Promise<{ person: Person; photos: Photo[] }> {
    const response = await api.get<{ person: Person; photos: Photo[] }>(`/faces/persons/${id}`);
    return response.data;
  },

  async updatePerson(id: string, name: string): Promise<{ person: Person }> {
    const response = await api.put<{ message: string; person: Person }>(
      `/faces/persons/${id}`,
      { name }
    );
    return response.data;
  },

  async mergePeople(
    sourcePersonId: string,
    targetPersonId: string
  ): Promise<{ person: Person }> {
    const response = await api.post<{ message: string; person: Person }>(
      '/faces/persons/merge',
      { sourcePersonId, targetPersonId }
    );
    return response.data;
  },

  async clusterFaces(): Promise<{ clustersCreated: number; totalFacesProcessed: number }> {
    const response = await api.post<{
      message: string;
      clustersCreated: number;
      totalFacesProcessed: number;
    }>('/faces/cluster');
    return response.data;
  },

  async assignFaceToPerson(faceId: string, personId: string): Promise<void> {
    await api.post('/faces/assign', { faceId, personId });
  },
};
