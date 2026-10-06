import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "../lib/api.client";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  role: "USER" | "ADMIN";
  provider?: "LOCAL" | "GOOGLE";
  premium?: boolean;
  joinDate?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; phone?: string; password: string }) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = api.getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const me = await api.get<User>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
      api.clearTokens();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const result = await api.post<{ user: User; accessToken: string; refreshToken: string }>("/auth/login", { email, password });
    api.setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  };

  const register = async (data: { firstName: string; lastName: string; email: string; phone?: string; password: string }) => {
    const result = await api.post<{ user: User; accessToken: string; refreshToken: string }>("/auth/register", data);
    api.setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  };

  const googleLogin = async (credential: string) => {
    const result = await api.post<{ user: User; accessToken: string; refreshToken: string }>("/auth/google", { credential });
    api.setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refreshToken });
      } catch {
        // ignore
      }
    }
    api.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAdmin: user?.role === "ADMIN",
        loading,
        login,
        register,
        googleLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
