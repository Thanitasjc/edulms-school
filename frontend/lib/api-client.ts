export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
};

export class ApiClientError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, code?: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

/**
 * Browser: same-origin `/api-proxy/v1` (Next rewrite → Laravel).
 * Server/SSR: absolute URL from env (or local default).
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api-proxy/v1";
  }

  return (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  companyId?: number | string | null;
  headers?: HeadersInit;
  cache?: RequestCache;
  signal?: AbortSignal;
};

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<ApiSuccess<T>> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  // Only set Content-Type when sending a body — avoids unnecessary CORS preflight on GET.
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  if (options.companyId) {
    headers.set("X-Company-Id", String(options.companyId));
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: options.cache ?? "no-store",
    signal: options.signal,
  });

  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null;

  if (!response.ok || !payload || payload.success === false) {
    throw new ApiClientError(
      payload && "message" in payload ? payload.message : "Request failed",
      response.status,
      payload && "code" in payload ? payload.code : undefined,
      payload && "errors" in payload ? payload.errors : undefined,
    );
  }

  return payload;
}
