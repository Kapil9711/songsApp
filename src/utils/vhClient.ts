import { InternalAxiosRequestConfig } from "axios";
import { createVH } from "vh-dev-client";
export const vh = createVH({
  appName: "Riffly",
  serverUrl: ["http://10.95.249.233:4317"],
  showConsoleOnLog: false,
});

// ============================================================
// HELPERS
// ============================================================

export const createRequestId = (): string => {
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}-${Math.random().toString(36).slice(2)}`;
};

export const getHeaders = (
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

export const sanitizeBody = (body: unknown): unknown => {
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
