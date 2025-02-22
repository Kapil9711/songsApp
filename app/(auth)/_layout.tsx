import { View, Text } from "react-native";
import React from "react";
import AuthProvider from "@/providers/AuthProvider";
import { Slot } from "expo-router";

const AuthLayout = () => {
  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0.8)" }}>
        <Slot />
      </View>
    </AuthProvider>
  );
};

export default AuthLayout;
