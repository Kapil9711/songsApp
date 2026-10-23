import { useState } from "react";
import { Alert } from "react-native";
import { LoginPayload } from "../api/api";

const useAuth = () => {
  const [form, setForm] = useState<Record<string, any>>({});
  const handleLogin = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const { password, userId } = form;
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
      Alert.alert("Error", "Complete all registration fields");
      return;
    }

    const payload = {
      password: password.trim(),
      name: name.trim(),
      email: email.trim(),
    };
  };

  return {
    handleLogin,
    handleRegister,
  };
};

export default useAuth;
