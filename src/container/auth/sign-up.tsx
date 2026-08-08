import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Spinner } from "tamagui";
import { useRouter } from "expo-router";

import { useAuthContext } from "@/src/providers/AuthProvider";
import { colors } from "@/src/constants/theme";
import KeyboardView from "../shared/keyboardView";

const SignUp = () => {
  const { form, setForm, isUserRegisterPending, handleRegister } =
    useAuthContext();

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardView>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Create account<Text style={styles.dot}>.</Text>
            </Text>

            <Text style={styles.subtitle}>
              Create your account and start listening to your favorite music.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  value={form.email}
                  onChangeText={(value) => {
                    setForm((prev: any) => ({
                      ...prev,
                      email: value,
                    }));
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  value={form.name}
                  onChangeText={(value) => {
                    setForm((prev: any) => ({
                      ...prev,
                      name: value,
                    }));
                  }}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  value={form.password}
                  onChangeText={(value) => {
                    setForm((prev: any) => ({
                      ...prev,
                      password: value,
                    }));
                  }}
                  placeholder="Create a password"
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

            {/* Register */}
            <Pressable
              disabled={isUserRegisterPending}
              onPress={handleRegister}
              style={[
                styles.registerButton,
                isUserRegisterPending && styles.registerButtonDisabled,
              ]}
            >
              {isUserRegisterPending ? (
                <Spinner size="small" color={colors.text} />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.orText}>or</Text>

            <View style={styles.divider} />
          </View>

          {/* Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>

            <Pressable
              onPress={() => {
                router.push("/(auth)/sign-in");
              }}
            >
              <Text style={styles.loginButton}>Log in</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardView>
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
    marginBottom: 32,
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
    gap: 18,
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

  showPassword: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 10,
  },

  registerButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  registerButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
  },

  registerButtonText: {
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

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  loginButton: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
});

export default SignUp;
