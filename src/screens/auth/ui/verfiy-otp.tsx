import { Container } from "@/components/container";
import Input from "@/components/input/CInput";
import KeyboardViewWithScroll from "@/components/keyboardView/keyboardViewWithScroll";
import { useTheme } from "@/themes/theme.context";
import { useAlertStore } from "@/store/alert.store";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useResponsiveStyles } from "react-native-fluid-styles";

import { useVerfiyOtpMutation, useResendOtpMutation } from "../api/api.queries";

type OtpFormData = {
  otp: string;
};

const RESEND_OTP_DELAY = 60;

const VerifyOtp = () => {
  const { Theme } = useTheme();
  const router = useRouter();

  const params = useLocalSearchParams<{
    userId: string;
    email?: string;
    password?: string;
  }>();

  const userId = params.userId;
  const email = params.email;
  const password = params.password;

  const styles = useStyles();

  const [secondsLeft, setSecondsLeft] = useState(RESEND_OTP_DELAY);

  const { control, handleSubmit, reset } = useForm<OtpFormData>({
    defaultValues: {
      otp: "",
    },
  });

  const { mutate: verifyOtp, isPending: isVerifying } = useVerfiyOtpMutation();

  const { mutate: resendOtp, isPending: isResending } = useResendOtpMutation();

  const showError = useAlertStore((state) => state.error);
  const showSuccess = useAlertStore((state) => state.success);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Format seconds as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const onVerify = (formData: OtpFormData) => {
    const enteredOtp = formData.otp.trim();

    if (!userId) {
      showError(
        "Verification Failed",
        "Your registration session is missing. Please register again.",
      );
      return;
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      showError(
        "Invalid OTP",
        "Please enter the complete 6-digit verification code.",
      );
      return;
    }

    verifyOtp(
      {
        userId,
        otp: enteredOtp,
      },
      {
        onSuccess: (response) => {
          const result = response?.data;

          if (result?.success === false) {
            showError(
              "Verification Failed",
              result?.message ?? "The OTP could not be verified.",
            );
            return;
          }

          showSuccess(
            "Email Verified",
            result?.message ?? "Your email has been verified successfully.",
          );
          router.replace({
            pathname: "/(auth)/sign-in",
            params: {
              email,
              password,
            },
          });
        },
      },
    );
  };

  const onResendOtp = () => {
    if (!userId) {
      showError(
        "Unable to resend OTP",
        "Your registration session is missing. Please register again.",
      );
      return;
    }

    // Prevent duplicate requests or bypassing the countdown.
    if (secondsLeft > 0 || isResending || isVerifying) {
      return;
    }

    resendOtp(
      { userId },
      {
        onSuccess: (response) => {
          const result = response?.data;

          if (result?.success === false) {
            showError(
              "Unable to resend OTP",
              result?.message ?? "Please try again later.",
            );
            return;
          }

          // Clear the previous OTP and restart the timer.
          reset({ otp: "" });
          setSecondsLeft(RESEND_OTP_DELAY);

          showSuccess(
            "OTP Sent",
            result?.message ??
              "A new verification code has been sent to your email.",
          );
        },
      },
    );
  };

  const isResendDisabled = secondsLeft > 0 || isResending || isVerifying;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[
          Theme.colors.primary + "2E",
          Theme.colors.primary + "0F",
          "transparent",
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.8 }}
        style={styles.topGlow}
        pointerEvents="none"
      />

      <KeyboardViewWithScroll>
        <Container>
          <View style={styles.container}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="mail-unread-outline"
                size={34}
                color={Theme.colors.primary}
              />
            </View>

            <Text style={styles.title}>
              Verify your email
              <Text style={styles.dot}>.</Text>
            </Text>

            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to
            </Text>

            {!!email && <Text style={styles.email}>{email}</Text>}

            <View style={styles.form}>
              <Text style={styles.label}>Verification code</Text>

              <Input
                name="otp"
                control={control}
                placeholder="Enter 6-digit OTP"
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                rules={{
                  required: "OTP is required",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Enter a valid 6-digit OTP",
                  },
                }}
              />

              <Pressable
                disabled={isVerifying || isResending}
                onPress={handleSubmit(onVerify) as any}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                  (isVerifying || isResending) && styles.buttonDisabled,
                ]}
              >
                {isVerifying ? (
                  <ActivityIndicator color={Theme.colors.background} />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify email</Text>
                )}
              </Pressable>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>

                <Pressable
                  disabled={isResendDisabled}
                  onPress={onResendOtp}
                  hitSlop={8}
                  style={({ pressed }) => [
                    secondsLeft > 0 && styles.buttonDisabled,
                    pressed && !isResendDisabled && styles.buttonPressed,
                  ]}
                >
                  {isResending ? (
                    <ActivityIndicator
                      size="small"
                      color={Theme.colors.primary}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.resendButton,
                        secondsLeft > 0 && styles.resendButtonDisabled,
                      ]}
                    >
                      {secondsLeft > 0
                        ? `Resend OTP in ${formatTime(secondsLeft)}`
                        : "Resend OTP"}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={() => router.replace("/(auth)/sign-in" as any)}
              style={styles.backButton}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={16} color={Theme.colors.text} />
              <Text style={styles.backButtonText}>Back to login</Text>
            </Pressable>
          </View>
        </Container>
      </KeyboardViewWithScroll>
    </View>
  );
};

export default VerifyOtp;

const useStyles = () => {
  const { Theme } = useTheme();

  return useResponsiveStyles(() => ({
    screen: {
      flex: 1,
      backgroundColor: Theme.colors.background,
    },

    topGlow: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "100%",
      height: "55%",
    },

    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingVertical: 32,
    },

    iconContainer: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor: Theme.colors.primary + "18",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },

    title: {
      fontSize: 30,
      fontWeight: "800",
      color: Theme.colors.text,
      marginBottom: 10,
    },

    dot: {
      color: Theme.colors.primary,
    },

    subtitle: {
      fontSize: 14,
      lineHeight: 22,
      color: Theme.colors.text,
      opacity: 0.7,
    },

    email: {
      fontSize: 14,
      fontWeight: "700",
      color: Theme.colors.primary,
      marginTop: 5,
      marginBottom: 28,
    },

    form: {
      gap: 14,
      marginTop: 28,
    },

    label: {
      fontSize: 13,
      fontWeight: "600",
      color: Theme.colors.text,
    },

    input: {
      flex: 1,
      fontSize: 18,
      color: Theme.colors.black,
      paddingVertical: 0,
      letterSpacing: 4,
      textAlign: "center",
    },

    primaryButton: {
      minHeight: 54,
      borderRadius: 16,
      backgroundColor: Theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },

    primaryButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: Theme.colors.background,
    },

    buttonPressed: {
      opacity: 0.85,
    },

    buttonDisabled: {
      opacity: 0.65,
    },

    resendContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 5,
      marginTop: 10,
    },

    resendText: {
      fontSize: 13,
      color: Theme.colors.text,
      opacity: 0.7,
    },

    resendButton: {
      fontSize: 13,
      fontWeight: "700",
      color: Theme.colors.primary,
    },

    resendButtonDisabled: {
      opacity: 0.5,
    },

    backButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 32,
    },

    backButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: Theme.colors.text,
    },
  }));
};
