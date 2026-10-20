import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";
import Input from "@/components/input/CInput";
import { useTheme } from "@/themes/theme.context";
import { vh } from "@/utils/vhClient";
import { LinearGradient } from "expo-linear-gradient";
import { useForm } from "react-hook-form";
import { useResponsiveStyles } from "react-native-fluid-styles";
import { useRegisterUserMutation } from "../api/api.queries";

const SignUp = () => {
  const { Theme } = useTheme();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { control, handleSubmit } = useForm();
  const styles = useStyles();
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
    const payload = {
      password: password.trim(),
      name: name.trim(),
      email: email.trim(),
    };

    vh.log.info("sign-up-inside", data);

    mutate(payload);
  };

  const onSubmit = (data: any) => {
    handleRegister(data);
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
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                Create account
                <Text style={styles.dot}>.</Text>
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

              {/* Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Name</Text>

                <Input
                  name="name"
                  control={control}
                  placeholder="Name"
                  rules={{ required: "Name is required" }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  //  placeholderTextColor={Theme.colors.}
                />
              </View>

              {/* Password */}
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

              {/* Register */}
              <Pressable
                disabled={isPending}
                onPress={handleSubmit(onSubmit) as any}
                style={[
                  styles.registerButton,
                  isPending && styles.registerButtonDisabled,
                ]}
              >
                {isPending ? (
                  <ActivityIndicator size="small" />
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
                  router.push("/(auth)/sign-in" as any);
                }}
              >
                <Text style={styles.loginButton}>Log in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Container>
    </View>
  );
};

const useStyles = () => {
  const { Theme } = useTheme();

  return useResponsiveStyles((r) => {
    return {
      container: {
        flex: 1,
      },
      passwordHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
        color: Theme.colors.text,
        marginBottom: 10,
      },

      dot: {
        color: Theme.colors.primary,
      },

      subtitle: {
        fontSize: 15,
        lineHeight: 22,
        color: Theme.colors.text,
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

      inputContainer: {
        height: 56,

        flexDirection: "row",
        alignItems: "center",

        backgroundColor: Theme.colors.background,

        borderWidth: 1,
        borderColor: Theme.colors.text,

        borderRadius: 16,

        paddingHorizontal: 16,
      },

      input: {
        flex: 1,

        fontSize: 15,

        color: Theme.colors.text,

        paddingVertical: 0,
      },

      showPassword: {
        fontSize: 13,
        fontWeight: "600",
        color: Theme.colors.primary,

        marginLeft: 10,
      },

      registerButton: {
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

      registerButtonDisabled: {
        backgroundColor: Theme.colors.background,

        shadowOpacity: 0,

        elevation: 0,
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

        backgroundColor: Theme.colors.text,
      },

      orText: {
        fontSize: 13,

        color: Theme.colors.text,

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
    };
  });
};

export default SignUp;
