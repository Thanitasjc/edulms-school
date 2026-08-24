import { apiClient } from "@/lib/api-client";
import type { AuthPayload, AuthUser, LoginInput, RegisterInput } from "./schemas";

const TOKEN_KEY = "edulms_token";
const COMPANY_KEY = "edulms_company_id";

function normalizeUser(user: AuthUser): AuthUser {
  const nested = user as AuthUser & { data?: AuthUser };
  const resolved =
    nested.data && typeof nested.data === "object" && "id" in nested.data && !user.email
      ? nested.data
      : user;

  return {
    ...resolved,
    roles: Array.isArray(resolved.roles) ? resolved.roles : Object.values(resolved.roles ?? {}),
    permissions: Array.isArray(resolved.permissions)
      ? resolved.permissions
      : Object.values(resolved.permissions ?? {}),
  };
}

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
  const user = normalizeUser(response.data.user);
  if (user.current_company_id) {
    setStoredCompanyId(user.current_company_id);
  }

  return { ...response.data, user };
}

export async function registerRequest(input: RegisterInput) {
  const response = await apiClient<AuthPayload>("/auth/register", {
    method: "POST",
    body: input,
  });

  setStoredToken(response.data.token);
  const user = normalizeUser(response.data.user);
  if (user.current_company_id) {
    setStoredCompanyId(user.current_company_id);
  }

  return { ...response.data, user };
}

export async function meRequest(token: string) {
  const response = await apiClient<{ user: AuthUser; enabled_modules: string[] }>("/auth/me", {
    token,
    companyId: getStoredCompanyId(),
  });

  return { ...response.data, user: normalizeUser(response.data.user) };
}

export async function logoutRequest(token: string) {
  await apiClient<null>("/auth/logout", {
    method: "POST",
    token,
    companyId: getStoredCompanyId(),
  });
  setStoredToken(null);
}
