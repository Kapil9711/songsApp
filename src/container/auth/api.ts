import endpoint from "@/src/network/endpoint";
import axios, { setAuthHeader } from "../../network/api";

export interface LoginPayload {
  email?: string;
  name?: string;
  password: string;
}

export const loginUser = async (payload: LoginPayload): Promise<any> => {
  await setAuthHeader();
  let response = await axios.post(endpoint.login, payload);
  return response;
};

export const createUser = async (payload: any): Promise<any> => {
  await setAuthHeader();
  let response = await axios.post(endpoint.register, payload);
  return response;
};
