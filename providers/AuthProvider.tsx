import { View, Text } from "react-native";
import React, { createContext, useContext } from "react";
import useAuth from "@/container/auth/hook";
const AuthContext = createContext(null as any);
export const useAuthContext = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }: any) => {
  const authData = useAuth();
  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
