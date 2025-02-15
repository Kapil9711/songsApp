import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LoginPayload, loginUser } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getValueInAsync, setValueInAsync } from "@/utilities/helpers";
import Toast from "react-native-simple-toast";
import { useRouter } from "expo-router";

const useAuth = () => {
  // **********************states section*************************
  const [form, setForm] = useState({} as any);
  const [isCheckingUserLogin, setIsCheckingUserLogin] = useState(true);
  const router = useRouter();

  // **********************states section*************************

  useEffect(() => {
    const checkIsLogin = async () => {
      const value = await getValueInAsync("token");
      if (value) {
        router.replace("/(dashboard)/Home");
      }
      setIsCheckingUserLogin(false);
    };
    checkIsLogin();
  }, []);

  //   ************************queries*****************************

  const { mutate: userLoginMutation, isPending: isUserLoginPending } =
    useMutation({
      mutationFn: loginUser,
      onSuccess: async ({ data }) => {
        if (data.success) {
          await setValueInAsync("token", data.token);
          Toast.showWithGravity("Login successFull", Toast.LONG, Toast.TOP);
          router.replace("/(dashboard)/Home");
        }
      },
      onError: (data) => {
        Toast.showWithGravity(
          "Please Fill Details Properly",
          Toast.LONG,
          Toast.TOP
        );
      },
    });

  //   ************************handlers*****************************

  const handleLogin = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const { password, userId } = form;
    console.log(form);
    if (password && userId) {
      const isEmail = emailRegex.test(userId);
      const payload: LoginPayload = { password };
      if (isEmail) payload.email = userId;
      else payload.username = userId;
      userLoginMutation(payload);
    }
  };

  //   ************************utility functions*****************************

  return {
    form,
    setForm,
    handleLogin,
    isCheckingUserLogin,
    isUserLoginPending,
  };
};

export default useAuth;
