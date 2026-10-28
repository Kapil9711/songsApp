import { useAuthStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { createUser, loginUser } from "./api";
import axios from "axios";

export const useLoginUserMutation = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: async ({ data }) => {
      if (data?.success || !data.data.token || !data.data.user) {
        Alert.alert("Error", "Login Failed");
        return;
      }
      setSession(data.data.token, data.data.user);
      router.replace("/(drawer)/(tabs)/home");
    },
    onError: (error) => {
      Alert.alert("Error", "Login Failed");
    },
  });
};

export const useRegisterUserMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: createUser,

    onSuccess: ({ data }) => {
      console.log(data);
      router.push("/(auth)/sign-in" as any);
    },

    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;

        const message =
          error.response?.data?.message ??
          error.response?.data?.error?.message ??
          error.message ??
          "Something went wrong";

        console.log("[REGISTER ERROR]", {
          statusCode,
          message,
          response: error.response?.data,
        });

        Alert.alert("Registration Failed", message);
        return;
      }

      Alert.alert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong",
      );
    },
  });
};
