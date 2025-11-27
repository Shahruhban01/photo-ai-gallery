import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', credentials);
    return response.data;
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/auth/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    const response = await api.put<{ message: string; user: User }>('/auth/profile', data);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
  },
};
