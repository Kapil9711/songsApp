import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";

import { createUser, LoginPayload, loginUser } from "./api";
import { useAuthStore } from "@/src/store/authStore";

const useAuth = () => {
  const [form, setForm] = useState<Record<string, any>>({});
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const { mutate: userLoginMutation, isPending: isUserLoginPending } =
    useMutation({
      mutationFn: loginUser,

      onSuccess: async ({ data }) => {
        if (!data.success || !data.token || !data.user) {
          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2: "Invalid response from server",
          });
          return;
        }

        try {
          // Persist the token securely before changing screens.
          await SecureStore.setItemAsync("auth_token", data.token);

          // Update the in-memory auth state.
          setSession(data.token, data.user);

          Toast.show({
            type: "success",
            text1: "Login Successful",
            visibilityTime: 1500,
            autoHide: true,
          });

          router.replace("/(dashboard)/home");
        } catch {
          Toast.show({
            type: "error",
            text1: "Could not save your session",
          });
        }
      },

      onError: () => {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          visibilityTime: 1500,
          autoHide: true,
        });
      },
    });

  const { mutate: userRegisterMutation, isPending: isUserRegisterPending } =
    useMutation({
      mutationFn: createUser,

      onSuccess: ({ data }) => {
        if (!data.success) {
          Toast.show({
            type: "error",
            text1: "Registration Failed",
          });
          return;
        }

        setForm({});

        Toast.show({
          type: "success",
          text1: "Signup Successful",
          visibilityTime: 1500,
          autoHide: true,
        });

        router.replace("/(auth)/sign-in");
      },

      onError: () => {
        Toast.show({
          type: "error",
          text1: "Signup Failed",
          visibilityTime: 1500,
          autoHide: true,
        });
      },
    });

  const handleLogin = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const { password, userId } = form;

    if (
      typeof password !== "string" ||
      !password.trim() ||
      typeof userId !== "string" ||
      !userId.trim()
    ) {
      Toast.show({
        type: "error",
        text1: "Enter your login details",
      });
      return;
    }

    const identifier = userId.trim();
    const payload: LoginPayload = { password };

    if (emailRegex.test(identifier)) {
      payload.email = identifier;
    } else {
      payload.name = identifier;
    }

    userLoginMutation(payload);
  };

  const handleRegister = () => {
    const { password, name, email } = form;

    if (
      typeof password !== "string" ||
      !password.trim() ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      Toast.show({
        type: "error",
        text1: "Complete all registration fields",
      });
      return;
    }

    userRegisterMutation({
      password: password.trim(),
      name: name.trim(),
      email: email.trim(),
    });
  };

  return {
    form,
    setForm,
    handleLogin,
    handleRegister,
    isUserLoginPending,
    isUserRegisterPending,
  };
};

export default useAuth;
