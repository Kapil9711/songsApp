import { Container } from "@/components/container";
import Input from "@/components/input/CInput";
import KeyboardViewWithScroll from "@/components/keyboardView/keyboardViewWithScroll";
import { useTheme } from "@/themes/theme.context";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useResponsiveStyles } from "react-native-fluid-styles";

import { useRegisterUserMutation } from "../api/api.queries";

const withOpacity = (color: string, opacity: number) => {
  if (color.startsWith("#")) {
    let hex = color.slice(1);

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  return color;
};

const SignUp = () => {
  const { Theme } = useTheme();
  const router = useRouter();
  const styles = useStyles();

  const [showPassword, setShowPassword] = useState(false);
  const { control, handleSubmit } = useForm();
  const { mutate, isPending } = useRegisterUserMutation();

  const handleRegister = (data: any) => {
    const { password, name, email } = data;

    if (
      typeof password !== "string" ||
      !password.trim() ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      Alert.alert("Error", "Complete all registration fields");
      return;
    }

    mutate({
      password: password.trim(),
      name: name.trim(),
      email: email.trim(),
    });
  };

  const onSubmit = (data: any) => {
    handleRegister(data);
  };

  return (
    <View style={styles.screen}>
      {/* Theme-based top glow */}
      <LinearGradient
        colors={[
          withOpacity(Theme.colors.primary, 0.18),
          withOpacity(Theme.colors.primary, 0.06),
          "transparent",
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.25, y: 0.7 }}
        style={styles.topGlow}
        pointerEvents="none"
      />

      {/* Theme-based bottom glow */}
      <LinearGradient
        colors={[
          "transparent",
          withOpacity(Theme.colors.primary, 0.04),
          withOpacity(Theme.colors.primary, 0.12),
        ]}
        start={{ x: 0.8, y: 0.2 }}
        end={{ x: 0, y: 1 }}
        style={styles.bottomGlow}
        pointerEvents="none"
      />

      <KeyboardViewWithScroll>
        <Container>
          <View style={styles.container}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  Create account
                  <Text style={styles.dot}>.</Text>
                </Text>

                <Text style={styles.subtitle}>
                  Create your account and start listening to your favorite
                  music.
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>Email</Text>

                  <Input
                    name="email"
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
                  <Text style={styles.label}>Name</Text>

                  <Input
                    name="name"
                    control={control}
                    placeholder="Name"
                    rules={{ required: "Name is required" }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <View style={styles.passwordHeader}>
                    <Text style={styles.label}>Password</Text>

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
                    rules={{ required: "Password is required" }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                    secureTextEntry={!showPassword}
                  />
                </View>

                <Pressable
                  disabled={isPending}
                  onPress={handleSubmit(onSubmit) as any}
                  style={({ pressed }) => [
                    styles.registerButton,
                    isPending && styles.registerButtonDisabled,
                    pressed && !isPending && styles.buttonPressed,
                  ]}
                >
                  {isPending ? (
                    <ActivityIndicator
                      size="small"
                      color={Theme.colors.background}
                    />
                  ) : (
                    <Text style={styles.registerButtonText}>
                      Create Account
                    </Text>
                  )}
                </Pressable>
              </View>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>

                <Pressable
                  onPress={() => router.push("/(auth)/sign-in" as any)}
                  hitSlop={8}
                >
                  <Text style={styles.loginButton}>Log in</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Container>
      </KeyboardViewWithScroll>
    </View>
  );
};

export default SignUp;

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

    bottomGlow: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "80%",
      height: "45%",
    },

    container: {
      flex: 1,
    },

    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingVertical: 24,
    },

    header: {
      marginBottom: 32,
    },

    title: {
      fontSize: 32,
      fontWeight: "700",
      color: Theme.colors.text,
      marginBottom: 10,
    },

    dot: {
      color: Theme.colors.primary,
    },

    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: withOpacity(Theme.colors.text, 0.72),
    },

    form: {
      gap: 18,
    },

    field: {
      gap: 8,
    },

    label: {
      fontSize: 13,
      fontWeight: "600",
      color: Theme.colors.text,
    },

    input: {
      flex: 1,
      fontSize: 15,
      color: Theme.colors.background,
      paddingVertical: 0,
    },

    passwordHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    showPassword: {
      fontSize: 13,
      fontWeight: "600",
      color: Theme.colors.primary,
      marginLeft: 10,
    },

    registerButton: {
      minHeight: 54,
      borderRadius: 16,
      backgroundColor: Theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
      shadowColor: Theme.colors.primary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.22,
      shadowRadius: 8,
      elevation: 4,
    },

    registerButtonDisabled: {
      backgroundColor: Theme.colors.secondary,
      shadowOpacity: 0,
      elevation: 0,
    },

    buttonPressed: {
      opacity: 0.85,
    },

    registerButtonText: {
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
      color: withOpacity(Theme.colors.text, 0.65),
      marginHorizontal: 14,
    },

    loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },

    loginText: {
      fontSize: 14,
      color: Theme.colors.text,
    },

    loginButton: {
      fontSize: 14,
      fontWeight: "700",
      color: Theme.colors.primary,
    },
  }));
};
