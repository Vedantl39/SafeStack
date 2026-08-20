import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/login", { email, password });
    return response.json();
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/register", { username, email, password });
    return response.json();
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiRequest("GET", "/api/me");
    return response.json();
  },

  setToken(token: string) {
    localStorage.setItem("auth_token", token);
  },

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  removeToken() {
    localStorage.removeItem("auth_token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
