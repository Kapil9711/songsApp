import { useAuthStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { createUser, loginUser } from "./api";

export const useLoginUserMutation = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: async ({ data }) => {
      if (!data.success || !data.token || !data.user) {
        Alert.alert("Error", "Login Failed");
        return;
      }
      setSession(data.token, data.user);
      router.push("/(drawer)/(tabs)");
    },
    onError: () => {
      Alert.alert("Error", "Login Failed");
    },
  });
};

export const useRegisterUserMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: createUser,
    onSuccess: ({ data }) => {
      if (!data.success) {
        Alert.alert("Error", "Registration Failed");
        return;
      }
      router.push("/(auth)/sign-in" as any);
    },

    onError: () => {
      Alert.alert("Error", "Registration Failed");
    },
  });
};
