import { useAppStore } from "@/app/store";
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

type QueryValue = string | number | boolean | null | undefined;

interface ApiRequestOptions<TBody> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  headers?: HeadersInit;
  auth?: boolean;
  signal?: AbortSignal;
  query?: Record<string, QueryValue>;
}

interface BackendEnvelope<TData> {
  success?: boolean;
  data?: TData & {
    msg?: string | string[];
  };
  msg?: string | string[];
  err?: unknown;
}

export class ApiError extends Error {
  status: number;
  messages: string[];
  payload?: unknown;

  constructor(message: string, options?: { status?: number; messages?: string[]; payload?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status ?? 500;
    this.messages = options?.messages ?? [message];
    this.payload = options?.payload;
  }
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function buildQueryString(query?: Record<string, QueryValue>) {
  if (!query) return "";

  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    searchParams.set(key, String(value));
  });

  const search = searchParams.toString();
  return search ? `?${search}` : "";
}

function extractMessages(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return ["Something went wrong."];
  }

  const source = payload as BackendEnvelope<Record<string, unknown>>;
  const message = source.data?.msg ?? source.msg;

  if (Array.isArray(message)) {
    return message.filter(Boolean).map(String);
  }

  if (typeof message === "string" && message.trim()) {
    return [message];
  }

  return ["Something went wrong."];
}

async function parseResponse<TData>(response: Response) {
  const text = await response.text();
  if (!text) {
    return null as BackendEnvelope<TData> | null;
  }

  try {
    return JSON.parse(text) as BackendEnvelope<TData>;
  } catch (error) {
    console.error("parseResponse error:", error);
    const trimmed = text.trimStart();
    const isHtml = trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html");

    return {
      success: false,
      data: {
        msg: isHtml
          ? `Unexpected HTML response from ${response.url}. Check VITE_API_BASE_URL and backend port.`
          : `Invalid JSON response from ${response.url}.`,
      },
    } as BackendEnvelope<TData>;
  }
}

export async function apiRequest<TData, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {}
) {
  const state = useAppStore.getState();
  const token = state.token;
  const {
    method = "GET",
    body,
    headers,
    auth = false,
    signal,
    query,
  } = options;

  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(query)}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const payload = await parseResponse<TData>(response);
  const messages = extractMessages(payload);

  if (!response.ok || payload?.success === false) {
    if (response.status === 401 || response.status === 403) {
      useAppStore.getState().clearSession();
    }

    throw new ApiError(messages[0], {
      status: response.status,
      messages,
      payload,
    });
  }

  if (payload?.data !== undefined) {
    return payload.data;
  }

  return payload as TData;
}

export function extractErrorMessages(error: any): string[] {
  if (!error) return ['An unknown error occurred.'];
  if (typeof error === 'string') return [error];
  if (error.response?.data?.data?.msg) return [error.response.data.data.msg];
  if (error.response?.data?.msg) return [error.response.data.msg];
  if (error.message) return [error.message];
  return ['Something went wrong.'];
}
