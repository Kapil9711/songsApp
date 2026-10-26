import { useTheme } from "@/themes/theme.context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useResponsive } from "react-native-fluid-styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const BackHeader = ({ title }: { title: string }) => {
  const { Theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const r = useResponsive();

  return (
    <View
      style={
        {
          // backgroundColor: Theme.colors.background,
          // paddingTop: insets.top,
        }
      }
    >
      <View
        style={{
          height: r.ms(48),
          flexDirection: "row",
          alignItems: "center",
          //   paddingHorizontal: r.ms(16),
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={{ marginRight: r.ms(20) }}
        >
          <Ionicons
            name="arrow-back"
            size={r.ms(24)}
            color={Theme.colors.text}
          />
        </Pressable>

        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: r.ms(18),
            fontWeight: "700",
            color: Theme.colors.text,
          }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};
