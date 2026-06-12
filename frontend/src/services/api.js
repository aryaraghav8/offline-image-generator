import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
class APIClient {
    constructor() {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.client.interceptors.response.use((response) => response, (error) => {
            console.error('API Error:', error.response?.data);
            return Promise.reject(error);
        });
    }
    // Models
    async getModels() {
        const response = await this.client.get('/models');
        return response.data;
    }
    async getModel(id) {
        const response = await this.client.get(`/models/${id}`);
        return response.data;
    }
    async installModel(id) {
        await this.client.post(`/models/${id}/install`);
    }
    async uninstallModel(id) {
        await this.client.post(`/models/${id}/uninstall`);
    }
    // Generation
    async generateImage(params) {
        const response = await this.client.post('/generate', params);
        return response.data;
    }
    async getGenerationStatus(id) {
        const response = await this.client.get(`/generations/${id}`);
        return response.data;
    }
    async getGenerationHistory(limit = 50, offset = 0) {
        const response = await this.client.get('/generations', {
            params: { limit, offset },
        });
        return response.data;
    }
    async deleteGeneration(id) {
        await this.client.delete(`/generations/${id}`);
    }
    async deleteImage(id) {
        await this.client.delete(`/images/${id}`);
    }
    // Favorites
    async toggleFavorite(imageId) {
        await this.client.post(`/images/${imageId}/favorite`);
    }
    async getFavorites() {
        const response = await this.client.get('/favorites');
        return response.data;
    }
    // Settings
    async getSettings() {
        const response = await this.client.get('/settings');
        return response.data;
    }
    async updateSettings(settings) {
        const response = await this.client.put('/settings', settings);
        return response.data;
    }
    // Download
    async downloadImage(imageId) {
        const response = await this.client.get(`/images/${imageId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    }
    // Health check
    async healthCheck() {
        const response = await this.client.get('/health');
        return response.data;
    }
}
export const apiClient = new APIClient();
