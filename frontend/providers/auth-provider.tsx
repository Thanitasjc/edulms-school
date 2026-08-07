"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getStoredToken,
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
  setStoredToken,
} from "@/features/auth/api";
import type { AuthUser, LoginInput, RegisterInput } from "@/features/auth/schemas";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  enabledModules: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const stored = getStoredToken();
    if (!stored) {
      setUser(null);
      setToken(null);
      setEnabledModules([]);
      setIsLoading(false);
      return;
    }

    try {
      const data = await meRequest(stored);
      setToken(stored);
      setUser(data.user);
      setEnabledModules(data.enabled_modules);
    } catch {
      setStoredToken(null);
      setUser(null);
      setToken(null);
      setEnabledModules([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (input: LoginInput) => {
    const data = await loginRequest(input);
    setToken(data.token);
    setUser(data.user);
    setEnabledModules(data.enabled_modules);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const data = await registerRequest(input);
    setToken(data.token);
    setUser(data.user);
    setEnabledModules(data.enabled_modules);
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutRequest(token);
      } catch {
        setStoredToken(null);
      }
    }
    setUser(null);
    setToken(null);
    setEnabledModules([]);
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      enabledModules,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refresh,
    }),
    [user, token, enabledModules, isLoading, login, logout, refresh, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
