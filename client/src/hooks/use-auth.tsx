import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, type User } from "@/lib/auth";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          authApi.removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: userData } = await authApi.login(email, password);
    authApi.setToken(token);
    setUser(userData);
    setLocation("/dashboard");
  };

  const register = async (username: string, email: string, password: string) => {
    const { token, user: userData } = await authApi.register(username, email, password);
    authApi.setToken(token);
    setUser(userData);
    setLocation("/dashboard");
  };

  const logout = () => {
    authApi.removeToken();
    setUser(null);
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
