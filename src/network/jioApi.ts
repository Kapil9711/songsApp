import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  setupCache,
  buildStorage,
  type StorageValue,
} from "axios-cache-interceptor";

import { vh } from "../utilities/vhClient";

// ============================================================
// TYPES
// ============================================================

interface ApiMetadata {
  requestId: string;
  startTime: number;
}

declare module "axios" {
  export interface AxiosRequestConfig {
    metadata?: ApiMetadata;
  }

  export interface InternalAxiosRequestConfig {
    metadata?: ApiMetadata;
  }
}

// ============================================================
// CONFIGURATION
// ============================================================

const BASE_URL = "https://saavn-api-mocha.vercel.app";

// const jioApi = "https://saavn-api-mocha.vercel.app";

const CACHE_PREFIX = "@api-cache:";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Requests matching these URLs will never be cached.
 *
 * You can use relative paths or full URLs.
 * Query strings and trailing slashes are ignored.
 *
 * Examples:
 * "/auth/login"
 * "/user/profile"
 * "/song/stream"
 * "https://song-backend-two.vercel.app/song/download"
 */
export const CACHE_EXCLUDED_URLS: string[] = [
  "/auth/login",
  "/auth/logout",
  "/auth/refresh",
  "/user/profile",
  "/song/stream",
  "/song/download",
  "https://song-backend-two.vercel.app/friend",
  "https://song-backend-two.vercel.app/user/all",
  "https://song-backend-two.vercel.app/friend/request",
];

// ============================================================
// REQUEST ID
// ============================================================

const createRequestId = (): string => {
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}-${Math.random().toString(36).slice(2)}`;
};

// ============================================================
// URL MATCHING
// ============================================================

/**
 * Convert a relative or absolute URL into a normalized pathname.
 */
const getPathname = (url: string, baseURL = BASE_URL): string => {
  try {
    const parsed = new URL(url, baseURL);
    return parsed.pathname.replace(/\/+$/, "") || "/";
  } catch {
    const pathname = url.split(/[?#]/)[0];
    return pathname.replace(/\/+$/, "") || "/";
  }
};

/**
 * Returns true when a request matches an excluded URL.
 *
 * Matches paths exactly:
 * /song/stream?id=123 -> /song/stream
 *
 * Does not match:
 * /song/streaming -> /song/stream
 */
const shouldSkipCache = (url?: string, baseURL?: string): boolean => {
  if (!url) return false;

  const requestPath = getPathname(url, baseURL);

  return CACHE_EXCLUDED_URLS.some((excludedUrl) => {
    const excludedPath = getPathname(excludedUrl, baseURL);
    return requestPath === excludedPath;
  });
};

// ============================================================
// PERSISTENT CACHE STORAGE
// ============================================================

/**
 * Cache entries are persisted in AsyncStorage.
 * They survive app restarts.
 */
const persistentStorage = buildStorage({
  async find(key) {
    const storageKey = `${CACHE_PREFIX}${key}`;
    const value = await AsyncStorage.getItem(storageKey);

    if (!value) {
      return undefined;
    }

    try {
      return JSON.parse(value) as StorageValue;
    } catch {
      // Remove corrupted cache entries.
      await AsyncStorage.removeItem(storageKey);
      return undefined;
    }
  },

  async set(key, value) {
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value));
  },

  async remove(key) {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  },

  async clear() {
    const keys = await AsyncStorage.getAllKeys();

    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  },
});

// ============================================================
// AXIOS INSTANCE + CACHE
// ============================================================

const jioApi = setupCache(
  axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  }),
  {
    storage: persistentStorage,
    ttl: CACHE_TTL,
    methods: ["get"],
    interpretHeader: false,
    debug: (log) => console.log("[AXIOS CACHE DEBUG]", log),
  },
);

// ============================================================
// AUTHENTICATION
// ============================================================

export const setAuthHeader = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      jioApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete jioApi.defaults.headers.common.Authorization;
    }
  } catch (error: unknown) {
    console.error("[AUTH] Failed to retrieve token", error);
  }
};

// ============================================================
// HELPERS
// ============================================================

const getHeaders = (
  headers: InternalAxiosRequestConfig["headers"],
): Record<string, string> => {
  if (!headers) return {};

  const result: Record<string, string> = {};

  Object.entries(headers.toJSON()).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      result[key] = String(value);
    }
  });

  // Never expose authentication credentials in logs.
  for (const key of Object.keys(result)) {
    if (["authorization", "cookie", "set-cookie"].includes(key.toLowerCase())) {
      delete result[key];
    }
  }

  return result;
};

const sanitizeBody = (body: unknown): unknown => {
  if (body === null || body === undefined) {
    return body;
  }

  let parsedBody: any = body;

  if (typeof parsedBody === "string") {
    try {
      parsedBody = JSON.parse(parsedBody);
    } catch {
      return parsedBody.length > 5000
        ? `${parsedBody.slice(0, 5000)}... [truncated]`
        : parsedBody;
    }
  }

  if (typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
    return parsedBody;
  }

  const sensitiveKeys = new Set([
    "password",
    "token",
    "accesstoken",
    "refreshtoken",
    "authorization",
    "cookie",
    "secret",
    "email",
    "phone",
  ]);

  const sanitized: Record<string, unknown> = {
    ...(parsedBody as Record<string, unknown>),
  };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    }
  }

  return sanitized;
};

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

jioApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const requestId = createRequestId();
    const startTime = Date.now();

    config.metadata = {
      requestId,
      startTime,
    };

    const method = config.method?.toUpperCase() ?? "GET";
    const url = jioApi.getUri(config);

    // Important: set this before the cache interceptor runs.
    const skipCache = shouldSkipCache(config.url, config.baseURL);

    if (skipCache) {
      (config as any).cache = { enabled: false };

      console.log("⚪ [CACHE BYPASS]", {
        requestId,
        method,
        url,
        message: "URL is excluded from caching",
      });
    }

    const headers = getHeaders(config.headers);
    const params = config.params;
    const body = sanitizeBody(config.data);

    console.log("🚀 [API REQUEST]", {
      requestId,
      method,
      url,
      params: params ?? {},
      body: body ?? {},
      headers,
      cacheExcluded: skipCache,
    });

    // Optional monitoring integration.
    // vh.network.req({
    //   requestId,
    //   method,
    //   url,
    //   params,
    //   headers,
    //   body,
    // });

    return config;
  },
  (error: unknown) => {
    console.error("[API REQUEST ERROR]", error);
    return Promise.reject(error);
  },
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

jioApi.interceptors.response.use(
  (response) => {
    const config = response.config;
    const metadata = config.metadata;

    const durationMs = metadata ? Date.now() - metadata.startTime : undefined;

    const method = config.method?.toUpperCase() ?? "GET";
    const url = jioApi.getUri(config);

    const skipCache = shouldSkipCache(config.url, config.baseURL);

    if (skipCache) {
      console.log("⚪ [CACHE BYPASS RESPONSE]", {
        requestId: metadata?.requestId,
        method,
        url,
        status: response.status,
        durationMs,
      });
    } else if (response.cached === true) {
      console.log("🟢 [CACHE HIT]", {
        requestId: metadata?.requestId,
        method,
        url,
        status: response.status,
        durationMs,
        message: "Response served from cache",
      });
    } else {
      console.log("🔵 [CACHE MISS]", {
        requestId: metadata?.requestId,
        method,
        url,
        status: response.status,
        durationMs,
        message: "Response received from network",
      });
    }

    const headers = getHeaders(config.headers);
    const body = sanitizeBody(response.data);

    console.log("✅ [API RESPONSE]", {
      requestId: metadata?.requestId ?? "UNKNOWN",
      method,
      url,
      status: response.status,
      durationMs,
      headers,
      data: body,
    });

    // Optional monitoring integration.
    // vh.network.res({
    //   requestId: metadata?.requestId,
    //   method,
    //   url,
    //   status: response.status,
    //   statusText: response.statusText,
    //   body,
    //   durationMs,
    // });

    return response;
  },

  (error: AxiosError) => {
    const config = error.config;
    const metadata = config?.metadata;

    const durationMs = metadata ? Date.now() - metadata.startTime : undefined;

    const method = config?.method?.toUpperCase() ?? "UNKNOWN";
    const url = config ? jioApi.getUri(config) : "UNKNOWN";
    const responseBody = sanitizeBody(error.response?.data);

    console.error("❌ [API ERROR]", {
      requestId: metadata?.requestId ?? "UNKNOWN",
      method,
      url,
      durationMs,
      status: error.response?.status,
      response: responseBody,
      message: error.message,
    });

    // Optional monitoring integration.
    // vh.network.res({
    //   requestId: metadata?.requestId,
    //   method,
    //   url,
    //   status: error.response?.status,
    //   statusText: error.response?.statusText,
    //   body: responseBody,
    //   durationMs,
    //   error: error.message,
    // });

    return Promise.reject(error);
  },
);

// ============================================================
// CACHE UTILITIES
// ============================================================

/**
 * Clear all persisted API cache entries.
 */
export const clearApiCache = async (): Promise<void> => {
  await (persistentStorage as any)?.clear();
  console.log("[CACHE] All API cache entries cleared");
};

/**
 * Call after login/logout or when you need to refresh a
 * particular resource manually.
 *
 * Clears the entire API cache for simplicity.
 */
export const refreshApiCache = async (): Promise<void> => {
  await clearApiCache();
};

void setAuthHeader();

export default jioApi;
