import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/themes/theme.context";
import { Music2, UserRound } from "lucide-react-native";
import { Text, View } from "react-native";
import { useResponsiveStyles } from "react-native-fluid-styles";
import { moderateScale } from "react-native-size-matters";

export default function DrawerUserProfile() {
  const user = useAuthStore((state) => state.user);
  const { Theme } = useTheme();
  const name = user?.name || "Music Lover";
  const email = user?.email || "";
  const styles = useStyles();

  return (
    <View
      style={[styles.container, { backgroundColor: Theme.colors.background }]}
    >
      <View style={styles.avatar}>
        <UserRound size={moderateScale(26)} color="#C5FF4A" />
      </View>

      <View style={styles.details}>
        <Text
          numberOfLines={1}
          style={[styles.name, { color: Theme.colors.text }]}
        >
          {name}
        </Text>

        {!!email && (
          <Text numberOfLines={1} style={styles.email}>
            {email}
          </Text>
        )}

        <View style={styles.brand}>
          <Music2 size={moderateScale(12)} color="#C5FF4A" />
          <Text style={styles.brandText}>RIFFLY MEMBER</Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = () => {
  return useResponsiveStyles(() => {
    return {
      container: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: moderateScale(10),
        gap: moderateScale(12),
      },
      avatar: {
        width: moderateScale(48),
        height: moderateScale(48),
        borderRadius: moderateScale(24),
        backgroundColor: "#252B35",
        alignItems: "center",
        justifyContent: "center",
      },
      details: {
        flex: 1,
        gap: moderateScale(4),
      },
      name: {
        fontSize: moderateScale(16),
        fontWeight: "700",
      },
      email: {
        color: "#929292",
        fontSize: moderateScale(12),
      },
      brand: {
        flexDirection: "row",
        alignItems: "center",
        gap: moderateScale(5),
        marginTop: moderateScale(2),
      },
      brandText: {
        color: "#C5FF4A",
        fontSize: moderateScale(9),
        fontWeight: "700",
        letterSpacing: 1,
      },
    };
  });
};
