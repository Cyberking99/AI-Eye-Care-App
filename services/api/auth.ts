import { apiClient } from './config';

export interface User {
  id: string;
  email: string;
  fullname?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullname?: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export const authService = {
  // Register a new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    console.log(response)
    await apiClient.setTokens(response.token, response.refreshToken);
    return response;
  },

  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    await apiClient.setTokens(response.token, response.refreshToken);
    return response;
  },

  // Refresh access token
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', data);
    await apiClient.setTokens(response.token, data.refreshToken);
    return response;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await apiClient.clearTokens();
    }
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    return await apiClient.get<User>('/users/profile');
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    return await apiClient.put<User>('/users/profile', data);
  },

  // Delete user account
  async deleteAccount(): Promise<void> {
    await apiClient.delete('/users/account');
    await apiClient.clearTokens();
  },
};
