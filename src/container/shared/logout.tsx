import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { LogOut } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type LogoutButtonProps = {
  onPress: () => void;
};

const LogoutButton = () => {
  const router = useRouter();
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setTimeout(() => {
      router.replace("/");
    }, 250);
  };
  return (
    <Pressable
      onPress={handleLogout}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <LogOut size={18} color="#EF4444" strokeWidth={2.2} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#1C1C20",
    borderWidth: 1,
    borderColor: "#27272A",
  },

  pressed: {
    backgroundColor: "#2A1518",
  },
});

export default LogoutButton;
