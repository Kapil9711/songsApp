import { Container } from "@/components/container";
import { useAuthStore } from "@/store/auth.store";
import useStore from "@/store/store";
import { useTheme } from "@/themes/theme.context";
import type { ColorSchemes } from "@/themes/theme.types";
import { Themes } from "@/themes/themes";
import { router } from "expo-router";
import {
  Check,
  ChevronDown,
  LogOut,
  Moon,
  Palette,
  Sun,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import DrawerUserProfile from "./components/drawerProfile";

const COLOR_SCHEMES: {
  id: ColorSchemes;
  label: string;
  Icon: typeof Sun;
}[] = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
];

const formatThemeName = (themeName: string) =>
  themeName
    .split(/[-_]/g)
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ");

export default function CustomDrawer() {
  const { Theme, setTheme } = useTheme();

  const clearSession = useAuthStore((state) => state.clearSession);

  const activeThemeId = useStore((state) => state.app.system.theme);

  const storedScheme = useStore((state) => state.app.system.colorScheme);

  const setColorScheme = useStore((state) => state.app.setColorScheme);

  const [appearanceExpanded, setAppearanceExpanded] = useState(true);

  const colors = Theme.colors;

  // Automatically discover themes from keys such as:
  // default.light, default.dark, midnight-violet.light
  const themeOptions = useMemo(() => {
    const names = Object.keys(Themes)
      .map((key) => {
        const separatorIndex = key.lastIndexOf(".");

        return separatorIndex >= 0 ? key.slice(0, separatorIndex) : key;
      })
      .filter(Boolean);

    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, []);

  const activeScheme: ColorSchemes =
    storedScheme === "light" || storedScheme === "dark" ? storedScheme : "dark";

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
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

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
  };

  const handleSchemeChange = (scheme: ColorSchemes) => {
    setColorScheme(scheme);
  };

  return (
    <Container>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <DrawerUserProfile />

          {/* Appearance section */}
          <View style={styles.section}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                expanded: appearanceExpanded,
              }}
              onPress={() => setAppearanceExpanded((value) => !value)}
              style={styles.sectionHeader}
            >
              <View style={styles.sectionTitleRow}>
                <Palette size={moderateScale(18)} color={colors.primary} />

                <Text style={[Theme.styles.H5, { color: colors.text }]}>
                  Appearance
                </Text>
              </View>

              <ChevronDown
                size={moderateScale(18)}
                color={colors.neutral400}
                style={{
                  transform: [
                    {
                      rotate: appearanceExpanded ? "180deg" : "0deg",
                    },
                  ],
                }}
              />
            </Pressable>

            {appearanceExpanded && (
              <View style={styles.sectionContent}>
                {/* Color scheme */}
                <Text
                  style={[
                    Theme.styles.Text,
                    styles.fieldLabel,
                    { color: colors.neutral400 },
                  ]}
                >
                  COLOR SCHEME
                </Text>

                <View
                  style={[
                    styles.schemeRow,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.neutral900,
                    },
                  ]}
                >
                  {COLOR_SCHEMES.map(({ id, label, Icon }) => {
                    const selected = activeScheme === id;

                    return (
                      <Pressable
                        key={id}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => handleSchemeChange(id)}
                        style={[
                          styles.schemeOption,
                          selected && {
                            backgroundColor: colors.primary,
                          },
                        ]}
                      >
                        <Icon
                          size={moderateScale(16)}
                          color={selected ? "#FFFFFF" : colors.neutral400}
                        />

                        <Text
                          style={[
                            styles.schemeText,
                            {
                              color: selected ? "#FFFFFF" : colors.text,
                            },
                          ]}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Available themes */}
                <Text
                  style={[
                    Theme.styles.Text,
                    styles.fieldLabel,
                    { color: colors.neutral400 },
                  ]}
                >
                  COLOR THEME
                </Text>

                <View style={styles.themeList}>
                  {themeOptions.map((themeId) => {
                    const selected = activeThemeId === themeId;

                    return (
                      <Pressable
                        key={themeId}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => handleThemeChange(themeId)}
                        style={[
                          styles.themeOption,
                          {
                            backgroundColor: colors.background,
                            borderColor: selected
                              ? colors.primary
                              : colors.neutral900,
                          },
                        ]}
                      >
                        {/* Theme color preview */}
                        <View
                          style={[
                            styles.colorSwatch,
                            {
                              backgroundColor: colors.primary,
                            },
                          ]}
                        />

                        <View style={styles.themeInfo}>
                          <Text
                            style={[styles.themeLabel, { color: colors.text }]}
                          >
                            {formatThemeName(themeId)}
                          </Text>

                          <Text
                            style={[
                              styles.themeDescription,
                              { color: colors.neutral400 },
                            ]}
                          >
                            {selected
                              ? "Currently selected"
                              : "Tap to apply this theme"}
                          </Text>
                        </View>

                        {selected && (
                          <Check
                            size={moderateScale(17)}
                            color={colors.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Logout */}
        <View
          style={[
            styles.footer,
            {
              borderTopColor: colors.neutral900,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              {
                backgroundColor: pressed ? colors.background : "transparent",
              },
            ]}
          >
            <LogOut size={moderateScale(18)} color={colors.danger} />

            <Text style={[styles.logoutText, { color: colors.danger }]}>
              Logout
            </Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: moderateScale(16),
  },

  section: {
    marginTop: moderateScale(20),
    paddingHorizontal: moderateScale(16),
  },

  sectionHeader: {
    minHeight: moderateScale(42),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
  },

  sectionContent: {
    marginTop: moderateScale(14),
    gap: moderateScale(12),
  },

  fieldLabel: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    letterSpacing: 1,
  },

  schemeRow: {
    flexDirection: "row",
    padding: moderateScale(4),
    borderRadius: moderateScale(12),
    borderWidth: StyleSheet.hairlineWidth,
    gap: moderateScale(4),
  },

  schemeOption: {
    flex: 1,
    minHeight: moderateScale(40),
    borderRadius: moderateScale(9),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(7),
  },

  schemeText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
  },

  themeList: {
    gap: moderateScale(8),
  },

  themeOption: {
    minHeight: moderateScale(62),
    borderRadius: moderateScale(12),
    borderWidth: StyleSheet.hairlineWidth,
    padding: moderateScale(10),
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
  },

  colorSwatch: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(10),
  },

  themeInfo: {
    flex: 1,
    gap: moderateScale(3),
  },

  themeLabel: {
    fontSize: moderateScale(13),
    fontWeight: "600",
  },

  themeDescription: {
    fontSize: moderateScale(11),
  },

  footer: {
    marginTop: "auto",
    padding: moderateScale(12),
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  logoutButton: {
    minHeight: moderateScale(42),
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(10),
  },

  logoutText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});
