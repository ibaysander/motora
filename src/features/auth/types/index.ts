export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: number;
    username: string;
  } | null;
} 