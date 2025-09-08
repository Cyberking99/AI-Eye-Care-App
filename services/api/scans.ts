import { apiClient } from './config';

export interface EyeScan {
  id: string;
  userId: string;
  imageUrl?: string; // not in API; keep for compatibility
  url?: string;
  publicId?: string;
  analysisResult?: {
    condition?: string;
    confidence: number;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  aiSummary?: string;
  createdAt: string;
  updatedAt?: string;
}

export const scansService = {
  // Upload an eye scan image (returns created scan)
  async uploadScan(imageUri: string): Promise<EyeScan> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'eye-scan.jpg',
    } as any);

    return await apiClient.upload<EyeScan>('/scans/upload', formData);
  },

  // Get a specific scan by ID
  async getScan(scanId: string): Promise<EyeScan> {
    return await apiClient.get<EyeScan>(`/scans/${scanId}`);
  },

  // Get all scans for the given user
  async getUserScans(userId: string): Promise<EyeScan[]> {
    return await apiClient.get<EyeScan[]>(`/scans/user/${userId}`);
  },

  // Delete a scan
  async deleteScan(scanId: string): Promise<void> {
    await apiClient.delete(`/scans/${scanId}`);
  },
};
