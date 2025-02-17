// import AuthPage from "@/container/auth";
import { getValueInAsync } from "@/utilities/helpers";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { Spinner } from "tamagui";
// import { Text, View } from "react-native";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkIsLogin = async () => {
      const value = await getValueInAsync("token");
      if (value) router.replace("/(dashboard)/home");
      else router.replace("/(auth)/sign-in");
    };
    checkIsLogin();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", paddingTop: 200 }}>
      <Spinner size="large" color={"#ff268b"} style={{ scale: 1.5 }} />
    </View>
  );
}
