import { Container } from "@/components/container";
import Input from "@/components/input/CInput";
import { useTheme } from "@/themes/theme.context";
import { vh } from "@/utils/vhClient";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { ResponsiveAPI, useResponsiveStyles } from "react-native-fluid-styles";
import { LoginPayload } from "../api/api";
import { useLoginUserMutation } from "../api/api.queries";

const SignIn = () => {
  const { Theme } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { control, handleSubmit } = useForm();
  const { mutate, isPending } = useLoginUserMutation();

  const handleLogin = async (data: any) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const { password, userId } = data;
    if (
      typeof password !== "string" ||
      !password.trim() ||
      typeof userId !== "string" ||
      !userId.trim()
    ) {
      Alert.alert("Error", "Enter Your Login Details");
      return;
    }
    const identifier = userId.trim();
    const payload: LoginPayload = { password };
    if (emailRegex.test(identifier)) {
      payload.email = identifier;
    } else {
      payload.name = identifier;
    }
    await mutate(payload);
  };

  const onSubmit = (data: any) => {
    vh.log.info("sign-in", data);
    handleLogin(data);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Theme.colors.background,
      }}
    >
      {/* Top purple glow */}
      <LinearGradient
        colors={[
          "rgba(168,85,247,0.22)",
          "rgba(168,85,247,0.08)",
          "transparent",
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.25, y: 0.7 }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "55%",
        }}
        pointerEvents="none"
      />

      {/* Bottom purple glow */}
      <LinearGradient
        colors={[
          "transparent",
          "rgba(168,85,247,0.04)",
          "rgba(168,85,247,0.12)",
        ]}
        start={{ x: 0.8, y: 0.2 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "80%",
          height: "45%",
        }}
        pointerEvents="none"
      />

      <Container>
        <View style={{ flex: 1 }}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                Welcome back
                <Text style={styles.dot}>.</Text>
              </Text>

              <Text style={styles.subtitle}>
                Login to continue listening to your favorite music.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>

                <Input
                  name="userId"
                  control={control}
                  placeholder="Email"
                  rules={{ required: "Email is required" }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <View style={styles.passwordHeader}>
                  <Text style={styles.label}>Password</Text>

                  {/* <Pressable onPress={() => {}}>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </Pressable> */}
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={10}
                  >
                    <Text style={styles.showPassword}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>

                <Input
                  name="password"
                  control={control}
                  placeholder="Password"
                  rules={{ required: "Email is required" }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                />
              </View>

              <Pressable
                disabled={isPending}
                onPress={handleSubmit(onSubmit) as any}
                style={[
                  styles.loginButton,
                  isPending && styles.loginButtonDisabled,
                ]}
              >
                {isPending ? (
                  <ActivityIndicator size={"small"} />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </Pressable>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />

              <Text style={styles.orText}>or</Text>

              <View style={styles.divider} />
            </View>

            {/* Signup */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>

              <Pressable
                onPress={() => {
                  router.push("/(auth)/sign-up" as any);
                }}
              >
                <Text style={styles.signupButton}>Sign up</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Container>
    </View>
  );
};

export default SignIn;

const useStyles = () => {
  const { Theme } = useTheme();
  return useResponsiveStyles((r: ResponsiveAPI) => {
    return {
      container: {
        flex: 1,
        backgroundColor: Theme?.colors?.background,
      },

      content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
      },

      header: {
        marginBottom: 36,
      },

      title: {
        fontSize: 32,
        fontWeight: "700",
        color: Theme?.colors?.text,
        marginBottom: 10,
      },

      dot: {
        color: Theme?.colors?.primary,
      },

      subtitle: {
        fontSize: 15,
        lineHeight: 22,
        color: Theme?.colors?.text,
      },

      form: {
        gap: 20,
      },

      field: {
        gap: 8,
      },

      label: {
        fontSize: 13,
        fontWeight: "600",
        color: Theme.colors.text,
      },

      inputContainer: {
        height: 56,

        flexDirection: "row",
        alignItems: "center",

        backgroundColor: Theme.colors.background,

        borderWidth: 1,
        borderColor: Theme.colors.primary,

        borderRadius: 16,

        paddingHorizontal: 16,
      },

      input: {
        flex: 1,
        fontSize: 15,
        color: Theme.colors.text,
        paddingVertical: 0,
      },

      passwordHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },

      forgotPassword: {
        fontSize: 13,
        fontWeight: "600",
        color: Theme.colors.primary,
      },

      showPassword: {
        fontSize: 13,
        fontWeight: "600",
        color: Theme.colors.primary,

        marginLeft: 10,
      },

      loginButton: {
        height: 56,

        borderRadius: 16,

        backgroundColor: Theme.colors.primary,

        alignItems: "center",
        justifyContent: "center",

        marginTop: 4,

        shadowColor: Theme.colors.primary,
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,

        elevation: 5,
      },

      loginButtonDisabled: {
        backgroundColor: Theme.colors.secondary,
        shadowOpacity: 0,
        elevation: 0,
      },

      loginButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: Theme.colors.background,
      },

      dividerContainer: {
        flexDirection: "row",
        alignItems: "center",

        marginVertical: 28,
      },

      divider: {
        flex: 1,

        height: 1,

        backgroundColor: Theme.colors.accent,
      },

      orText: {
        fontSize: 13,

        color: Theme.colors.text,

        marginHorizontal: 14,
      },

      signupContainer: {
        flexDirection: "row",

        justifyContent: "center",
        alignItems: "center",
      },

      signupText: {
        fontSize: 14,
        color: Theme.colors.text,
      },

      signupButton: {
        fontSize: 14,

        fontWeight: "700",

        color: Theme.colors.primary,
      },
    };
  });
};
