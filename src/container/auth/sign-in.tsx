import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Spinner } from "tamagui";
import { useRouter } from "expo-router";

import { useAuthContext } from "@/src/providers/AuthProvider";
import { colors } from "@/src/constants/theme";
import KeyboardView from "../shared/keyboardView";

const SignIn = () => {
  const { form, setForm, handleLogin, isUserLoginPending } = useAuthContext();

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Welcome back<Text style={styles.dot}>.</Text>
          </Text>

          <Text style={styles.subtitle}>
            Login to continue listening to your favorite music.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email / Username */}
          <View style={styles.field}>
            <Text style={styles.label}>Email or Username</Text>

            <View style={styles.inputContainer}>
              <TextInput
                value={form.userId}
                onChangeText={(value) => {
                  setForm((prev: any) => ({
                    ...prev,
                    userId: value,
                  }));
                }}
                placeholder="Enter your email or username"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Password</Text>

              <Pressable
                onPress={() => {
                  // Forgot password
                }}
              >
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                value={form.password}
                onChangeText={(value) => {
                  setForm((prev: any) => ({
                    ...prev,
                    password: value,
                  }));
                }}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.input}
              />

              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={10}
              >
                <Text style={styles.showPassword}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Login button */}
          <Pressable
            disabled={isUserLoginPending}
            onPress={handleLogin}
            style={[
              styles.loginButton,
              isUserLoginPending && styles.loginButtonDisabled,
            ]}
          >
            {isUserLoginPending ? (
              <Spinner size="small" color={colors.text} />
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
              router.push("/(auth)/sign-up");
            }}
          >
            <Text style={styles.signupButton}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
    marginBottom: 10,
  },

  dot: {
    color: colors.primary,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
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
    color: colors.text,
  },

  inputContainer: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
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
    color: colors.primary,
  },

  showPassword: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 10,
  },

  loginButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  loginButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
  },

  loginButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  orText: {
    fontSize: 13,
    color: colors.textMuted,
    marginHorizontal: 14,
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  signupText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  signupButton: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
});

export default SignIn;
