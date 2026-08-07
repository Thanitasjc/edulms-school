import { apiClient } from "@/lib/api-client";
import type { AuthPayload, AuthUser, LoginInput, RegisterInput } from "./schemas";

const TOKEN_KEY = "edulms_token";
const COMPANY_KEY = "edulms_company_id";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(COMPANY_KEY);
}

export function setStoredCompanyId(companyId: number | string | null): void {
  if (typeof window === "undefined") return;
  if (companyId) localStorage.setItem(COMPANY_KEY, String(companyId));
  else localStorage.removeItem(COMPANY_KEY);
}

export async function loginRequest(input: LoginInput) {
  const response = await apiClient<AuthPayload>("/auth/login", {
    method: "POST",
    body: {
      ...input,
      device_name: input.device_name ?? "web",
    },
  });

  setStoredToken(response.data.token);
  if (response.data.user.current_company_id) {
    setStoredCompanyId(response.data.user.current_company_id);
  }

  return response.data;
}

export async function registerRequest(input: RegisterInput) {
  const response = await apiClient<AuthPayload>("/auth/register", {
    method: "POST",
    body: input,
  });

  setStoredToken(response.data.token);
  if (response.data.user.current_company_id) {
    setStoredCompanyId(response.data.user.current_company_id);
  }

  return response.data;
}

export async function meRequest(token: string) {
  const response = await apiClient<{ user: AuthUser; enabled_modules: string[] }>("/auth/me", {
    token,
    companyId: getStoredCompanyId(),
  });

  return response.data;
}

export async function logoutRequest(token: string) {
  await apiClient<null>("/auth/logout", {
    method: "POST",
    token,
    companyId: getStoredCompanyId(),
  });
  setStoredToken(null);
}
