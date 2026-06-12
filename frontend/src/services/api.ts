import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  Model,
  GenerationParams,
  GeneratedImage,
  Generation,
  AppSettings,
  ErrorResponse,
} from '@/types';

interface GenerateResponse {
  success: boolean;
  imageUrl: string;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        console.error('API Error:', error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Models
  async getModels(): Promise<Model[]> {
    const response = await this.client.get<Model[]>('/models');
    return response.data;
  }

  async getModel(id: string): Promise<Model> {
    const response = await this.client.get<Model>(`/models/${id}`);
    return response.data;
  }

  async installModel(id: string): Promise<void> {
    await this.client.post(`/models/${id}/install`);
  }

  async uninstallModel(id: string): Promise<void> {
    await this.client.post(`/models/${id}/uninstall`);
  }

  // Generation
  async generateImage(
    params: GenerationParams
  ): Promise<GenerateResponse> {

    const response =
      await this.client.post<GenerateResponse>(
        '/generate',
        params
      );

    return response.data;
  }

  async getImages(): Promise<GeneratedImage[]> {
    const response = await this.client.get<GeneratedImage[]>('/images');
    return response.data;
  }

  async getGenerationStatus(id: string): Promise<Generation> {
    const response = await this.client.get<Generation>(`/generations/${id}`);
    return response.data;
  }

  async getGenerationHistory(limit = 50, offset = 0): Promise<{
    items: Generation[];
    total: number;
  }> {
    const response = await this.client.get('/generations', {
      params: { limit, offset },
    });
    return response.data;
  }

  async deleteGeneration(id: string): Promise<void> {
    await this.client.delete(`/generations/${id}`);
  }

  async deleteImage(id: string): Promise<void> {
    await this.client.delete(`/images/${id}`);
  }

  // Favorites
  async toggleFavorite(imageId: string): Promise<void> {
    await this.client.post(`/images/${imageId}/favorite`);
  }

  async getFavorites(): Promise<GeneratedImage[]> {
    const response = await this.client.get<GeneratedImage[]>('/favorites');
    return response.data;
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    const response = await this.client.get<AppSettings>('/settings');
    return response.data;
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const response = await this.client.put<AppSettings>('/settings', settings);
    return response.data;
  }

  // Download
  async downloadImage(imageId: string): Promise<Blob> {
    const response = await this.client.get(`/images/${imageId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get<{ status: string }>('/health');
    return response.data;
  }
}

export const apiClient = new APIClient();
