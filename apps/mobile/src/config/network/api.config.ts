import { API_BASE_URL, JIO_API_BASE_URL } from "@/constants";
import { useAuthStore } from "@/store/auth.store";
import {
  createRequestId,
  getHeaders,
  sanitizeBody,
  vh,
} from "@/utils/vhClient";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

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
// AXIOS INSTANCE + CACHE
// ============================================================

function createApiConfig(baseUrl: string | undefined) {
  const api = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const setAuthHeader = async (): Promise<void> => {
    try {
      const token = useAuthStore.getState().token;

      if (token) {
        api.defaults.headers.common.authorization = `Bearer ${token}`;
      } else {
        delete api.defaults.headers.common.authorization;
      }
    } catch (error: unknown) {
      console.error("[AUTH] Failed to retrieve token", error);
    }
  };

  // ============================================================
  // REQUEST INTERCEPTOR
  // ============================================================

  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const requestId = createRequestId();
      const startTime = Date.now();

      config.metadata = {
        requestId,
        startTime,
      };
      await setAuthHeader();
      const method = config.method?.toUpperCase() ?? "GET";
      const url = api.getUri(config);

      const headers = getHeaders(config.headers);

      const params = config.params;
      const body = sanitizeBody(config.data);

      // Optional monitoring integration.
      vh.network.req({
        requestId,
        method,
        url,
        params,
        headers,
        body,
      });

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

  api.interceptors.response.use(
    (response) => {
      const config = response.config;
      const metadata = config.metadata;
      const durationMs = metadata ? Date.now() - metadata.startTime : undefined;
      const method = config.method?.toUpperCase() ?? "GET";
      const url = api.getUri(config);
      const headers = getHeaders(config.headers);
      const body = sanitizeBody(response.data);

      // Optional monitoring integration.
      vh.network.res({
        requestId: metadata?.requestId as any,
        method,
        url,
        status: response.status,
        statusText: response.statusText,
        body,
        durationMs,
      });

      return response;
    },

    (error: AxiosError) => {
      const config = error.config;
      const metadata = config?.metadata;

      const durationMs = metadata ? Date.now() - metadata.startTime : undefined;

      const method = config?.method?.toUpperCase() ?? "UNKNOWN";
      const url = config ? api.getUri(config) : "UNKNOWN";
      const responseBody = sanitizeBody(error.response?.data);

      // Optional monitoring integration.
      vh.network.res({
        requestId: metadata?.requestId as any,
        method,
        url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        body: responseBody,
        durationMs,
        error: error.message,
      });

      return Promise.reject(error);
    },
  );

  return api;
}

export const api = createApiConfig("http://192.168.1.6:5002/api/v1");
export const jioApi = createApiConfig(JIO_API_BASE_URL);
