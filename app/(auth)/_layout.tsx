import { View, Text } from "react-native";
import React from "react";
import AuthProvider from "@/src/providers/AuthProvider";
import { Slot } from "expo-router";
import { colors } from "@/src/constants/theme";

const AuthLayout = () => {
  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Slot />
      </View>
    </AuthProvider>
  );
};

export default AuthLayout;
