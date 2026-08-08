import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "https://song-backend-two.vercel.app",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get token and set Authorization header
 */
export const setAuthHeader = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error("❌ [AUTH] Failed to retrieve token", error);
  }
};

/**
 * Request interceptor
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const startTime = Date.now();

    // Store request start time so we can calculate duration
    (config as any).metadata = {
      startTime,
    };

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 [API REQUEST]");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("➡️ Method:", config.method?.toUpperCase());
    console.log("🌐 URL:", `${config.baseURL}${config.url}`);

    if (config.params) {
      console.log("🔎 Params:", config.params);
    }

    if (config.data) {
      console.log("📦 Body:", config.data);
    }

    if (config.headers) {
      console.log("📋 Headers:", config.headers);
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return config;
  },
  (error) => {
    console.error("❌ [API REQUEST ERROR]");
    console.error(error);

    return Promise.reject(error);
  },
);

/**
 * Response interceptor
 */
api.interceptors.response.use(
  (response: any) => {
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? `${Date.now() - startTime}ms` : "N/A";

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ [API RESPONSE]");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("➡️ Method:", response.config.method?.toUpperCase());
    console.log("🌐 URL:", `${response.config.baseURL}${response.config.url}`);
    console.log("📊 Status:", response.status);
    console.log("⏱️ Duration:", duration);
    console.log("📦 Data:", response.data);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return response;
  },

  (error: AxiosError) => {
    const config = error.config;

    const startTime = (config as any)?.metadata?.startTime;
    const duration = startTime ? `${Date.now() - startTime}ms` : "N/A";

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("❌ [API ERROR]");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("➡️ Method:", config?.method?.toUpperCase() ?? "UNKNOWN");

    console.log(
      "🌐 URL:",
      config ? `${config.baseURL}${config.url}` : "UNKNOWN",
    );

    console.log("⏱️ Duration:", duration);

    if (error.response) {
      // Server responded with an error status
      console.log("📊 Status:", error.response.status);
      console.log("📊 Status Text:", error.response.statusText);
      console.log("📦 Response:", error.response.data);
      console.log("📋 Headers:", error.response.headers);
    } else if (error.request) {
      // Request was made but no response received
      console.log("📡 No response received from server");
      console.log("📦 Request:", error.request);
    } else {
      // Something went wrong before request was sent
      console.log("⚠️ Error Message:", error.message);
    }

    console.log("🔴 Axios Error:", error.message);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return Promise.reject(error);
  },
);

setAuthHeader();

export default api;
