import endpoint from "@/network/endpoint";
import axios, { setAuthHeader } from "../../network/api";

export interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
}

export const loginUser = async (payload: LoginPayload): Promise<any> => {
  await setAuthHeader();
  let response: any;
  response = await axios.post(endpoint.login, payload);
  return response;
};
