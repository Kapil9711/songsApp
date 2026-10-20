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
