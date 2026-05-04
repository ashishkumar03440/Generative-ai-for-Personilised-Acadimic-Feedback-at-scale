import React, { createContext, useContext, useState, useCallback } from "react";
import { API_BASE } from "@/lib/api";

export type UserRole = "student" | "teacher" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("eduAi_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem("eduAi_user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    try {
      // Tell the server to invalidate the refresh token and clear the HttpOnly cookie
      await fetch(`${API_BASE}/user/logout`, {
        method: "POST",
        credentials: "include",  // ← sends the HttpOnly cookie so server can clear it
      });
    } catch {
      // Non-fatal — still clear client-side state
    }
    setUser(null);
    localStorage.removeItem("eduAi_user");
    sessionStorage.removeItem("accessToken");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
