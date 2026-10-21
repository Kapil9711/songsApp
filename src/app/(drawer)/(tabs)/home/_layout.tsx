import { useTheme } from "@/themes/theme.context";
import { Stack } from "expo-router";

const HomeLayout = () => {
  const { Theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 100,
        gestureEnabled: true,
        contentStyle: [{ flex: 1 }, Theme.styles.Bg],
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Song",
        }}
        name="song"
      />
    </Stack>
  );
};

export default HomeLayout;
