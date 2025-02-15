import AuthPage from "@/container/auth";
import { Text, View } from "react-native";

export default function HomePage() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AuthPage />
    </View>
  );
}
