import { useTheme } from "@/themes/theme.context";
import { Stack } from "expo-router";
import { View } from "react-native";

const AuthLayout = () => {
  const { Theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,

          animation: "slide_from_right",
          animationDuration: 200,
          gestureEnabled: true,
          contentStyle: [{ flex: 1 }, Theme.styles.Bg],
        }}
      >
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
      </Stack>
    </View>
  );
};

export default AuthLayout;
