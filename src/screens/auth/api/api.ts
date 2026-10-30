import { api } from "@/config/network/api.config";
import { endpoints } from "@/config/network/endpoints";

export interface LoginPayload {
  email?: string;
  name?: string;
  password: string;
}

export const loginUser = async (payload: LoginPayload): Promise<any> => {
  let response = await api.post(endpoints.api.login, payload);
  return response;
};

export const createUser = async (payload: any): Promise<any> => {
  let response = await api.post(endpoints.api.register, payload);
  return response;
};

export const verifyOtp = async (payload: {
  userId: string;
  otp: string;
}): Promise<any> => {
  let response = await api.post(endpoints.api.verfiyOtp, payload);
  return response;
};

export const resendOtp = async (payload: { userId: string }): Promise<any> => {
  let response = await api.post(endpoints.api.resendOtp, payload);
  return response;
};
