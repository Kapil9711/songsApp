import { useAuthStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { createUser, loginUser, resendOtp, verifyOtp } from "./api";
import { useAlertStore } from "@/store/alert.store";
export const useLoginUserMutation = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();
  const error = useAlertStore((state) => state.error);
  return useMutation({
    mutationFn: loginUser,
    onSuccess: async ({ data }) => {
      console.log(data, "logindata");
      if (!data?.success || !data.data.token || !data.data.user) {
        error("Login Failed", "Login failed for unknow reason");

        return;
      }
      setSession(data.data.token, data.data.user);
      router.replace("/(drawer)/(tabs)/home");
    },
  });
};

export const useRegisterUserMutation = () => {
  return useMutation({
    mutationFn: createUser,
  });
};

export const useVerfiyOtpMutation = () => {
  return useMutation({
    mutationFn: verifyOtp,
  });
};

export const useResendOtpMutation = () => {
  return useMutation({
    mutationFn: resendOtp,
  });
};
