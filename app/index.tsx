import SplashScreen from "@/src/container/splashScreen";
import { getValueInAsync } from "@/src/utilities/helpers";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

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
    <View className="flex-1 bg-white">
      <SplashScreen />
    </View>
  );
}
