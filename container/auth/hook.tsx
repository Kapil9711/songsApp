import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createUser, LoginPayload, loginUser } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getValueInAsync, setValueInAsync } from "@/utilities/helpers";

import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

const useAuth = () => {
  // **********************states section*************************
  const [form, setForm] = useState({} as any);
  const [isCheckingUserLogin, setIsCheckingUserLogin] = useState(true);
  const router = useRouter();

  // **********************states section*************************

  // useEffect(() => {
  //   const checkIsLogin = async () => {
  //     const value = await getValueInAsync("token");
  //     if (value) {
  //       router.replace("/(dashboard)/home");
  //     } else router.push("/(auth)/sign-in");
  //     setIsCheckingUserLogin(false);
  //   };
  //   checkIsLogin();
  // }, []);

  //   ************************queries*****************************

  const { mutate: userLoginMutation, isPending: isUserLoginPending } =
    useMutation({
      mutationFn: loginUser,
      onSuccess: async ({ data }) => {
        if (data.success) {
          Toast.show({
            type: "success", // success | error | info
            text1: "Login SuccessFull",
            // text2: "File is Deleted Successfully",
            visibilityTime: 1500,
            autoHide: true,
          });
          await setValueInAsync("token", data.token);
          await setValueInAsync("user", JSON.stringify(data?.user));
          router.replace("/(dashboard)/home");
        }
      },
      onError: (data) => {
        Toast.show({
          type: "error", // success | error | info
          text1: "Login Failed",
          // text2: "File is Deleted Successfully",
          visibilityTime: 1500,
          autoHide: true,
        });
      },
    });

  const { mutate: userRegisterMutation, isPending: isUserRegisterPending } =
    useMutation({
      mutationFn: createUser,
      onSuccess: async ({ data }) => {
        if (data.success) {
          setForm({});
          Toast.show({
            type: "success", // success | error | info
            text1: "SignUp  SuccessFull",
            // text2: "File is Deleted Successfully",
            visibilityTime: 1500,
            autoHide: true,
          });
          // await setValueInAsync("token", data.token);
          router.replace("/(auth)/sign-in");
        }
      },
      onError: (data) => {
        Toast.show({
          type: "error", // success | error | info
          text1: "SignUp Failed",
          // text2: "File is Deleted Successfully",
          visibilityTime: 1500,
          autoHide: true,
        });
      },
    });

  //   ************************handlers*****************************

  const handleLogin = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const { password, userId } = form;

    if (password && userId) {
      const isEmail = emailRegex.test(userId);
      const payload: LoginPayload = { password };
      if (isEmail) payload.email = userId;
      else payload.name = userId;
      userLoginMutation(payload);
    }
  };

  const handleRegister = async () => {
    const { password, name, email } = form;

    if (password && name && email) {
      const payload = { password, name, email };

      userRegisterMutation(payload);
    }
  };

  //   ************************utility functions*****************************

  return {
    form,
    setForm,
    handleLogin,
    isCheckingUserLogin,
    isUserLoginPending,
    isUserRegisterPending,
    handleRegister,
  };
};

export default useAuth;
