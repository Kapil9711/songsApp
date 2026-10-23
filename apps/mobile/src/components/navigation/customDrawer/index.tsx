import { Container } from "@/components/container";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/themes/theme.context";
import { router } from "expo-router";
import { LogOut } from "lucide-react-native";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import DrawerUserProfile from "./components/drawerProfile";

export default function CustomDrawer() {
  const { Theme } = useTheme();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          clearSession();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <Container>
      <View
        style={[styles.container, { backgroundColor: Theme.colors.background }]}
      >
        {/* <View
          style={{
            flexDirection: "row",
            gap: moderateScale(10),
            alignItems: "center",
          }}
        >
          <Logo />
          <Text style={[{ color: Theme.colors.text }, Theme.styles.H4]}>
            Riffly
          </Text>
        </View> */}

        <DrawerUserProfile />

        <View style={styles.footer}>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={moderateScale(18)} color="#FF5252" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  footer: { marginTop: "auto", padding: moderateScale(16) },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
    padding: moderateScale(10),
  },
  logoutText: {
    color: "#FF5252",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});
