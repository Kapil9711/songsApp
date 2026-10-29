import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useResponsive } from "react-native-fluid-styles";
import { useTheme } from "@/themes/theme.context";
import { useAlertStore, type AlertType } from "@/store/alert.store";

const ALERT_CONFIG = {
  success: {
    icon: "checkmark-circle" as const,
    color: "#16A34A",
    background: "#DCFCE7",
    defaultTitle: "Success",
  },
  error: {
    icon: "close-circle" as const,
    color: "#DC2626",
    background: "#FEE2E2",
    defaultTitle: "Something went wrong",
  },
  warning: {
    icon: "alert-circle" as const,
    color: "#D97706",
    background: "#FEF3C7",
    defaultTitle: "Warning",
  },
  info: {
    icon: "information-circle" as const,
    color: "#2563EB",
    background: "#DBEAFE",
    defaultTitle: "Information",
  },
  confirm: {
    icon: "help-circle" as const,
    color: "#7C3AED",
    background: "#EDE9FE",
    defaultTitle: "Are you sure?",
  },
} satisfies Record<
  AlertType,
  {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    color: string;
    background: string;
    defaultTitle: string;
  }
>;

export default function CustomAlert() {
  const { Theme } = useTheme();
  const r = useResponsive();

  const visible = useAlertStore((state) => state.visible);
  const type = useAlertStore((state) => state.type);
  const title = useAlertStore((state) => state.title);
  const message = useAlertStore((state) => state.message);
  const confirmText = useAlertStore((state) => state.confirmText);
  const cancelText = useAlertStore((state) => state.cancelText);

  const hide = useAlertStore((state) => state.hide);
  const accept = useAlertStore((state) => state.accept);
  const cancel = useAlertStore((state) => state.cancel);

  const config = ALERT_CONFIG[type];
  const isConfirmation = type === "confirm";

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: r.ms(24),
      backgroundColor: "rgba(0,0,0,0.52)",
    },

    card: {
      width: "100%",
      maxWidth: r.ms(360),
      padding: r.ms(22),
      paddingTop: r.ms(27),
      borderRadius: r.ms(24),
      alignItems: "center",
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: Theme.styles.Card.borderColor,
      elevation: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
    },

    closeButton: {
      position: "absolute",
      top: r.ms(12),
      right: r.ms(12),
      width: r.ms(30),
      height: r.ms(30),
      borderRadius: r.ms(15),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Theme.styles.Card.backgroundColor,
      zIndex: 1,
    },

    iconContainer: {
      width: r.ms(62),
      height: r.ms(62),
      borderRadius: r.ms(21),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: r.ms(16),
    },

    title: {
      color: Theme.colors.text,
      fontSize: r.ms(20),
      lineHeight: r.ms(26),
      fontWeight: "800",
      letterSpacing: -0.4,
      textAlign: "center",
    },

    message: {
      color: Theme.colors.text,
      opacity: 0.68,
      fontSize: r.ms(13),
      lineHeight: r.ms(20),
      textAlign: "center",
      marginTop: r.ms(9),
    },

    buttonRow: {
      flexDirection: "row",
      width: "100%",
      gap: r.ms(10),
      marginTop: r.ms(24),
    },

    button: {
      flex: 1,
      minHeight: r.ms(46),
      borderRadius: r.ms(14),
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: r.ms(10),
    },

    primaryButton: {
      backgroundColor: Theme.colors.primary,
    },

    secondaryButton: {
      backgroundColor: Theme.styles.Card.backgroundColor,
      borderWidth: 1,
      borderColor: Theme.styles.Card.borderColor,
    },

    primaryButtonText: {
      color: Theme.colors.background,
      fontSize: r.ms(13),
      fontWeight: "800",
    },

    secondaryButtonText: {
      color: Theme.colors.text,
      fontSize: r.ms(13),
      fontWeight: "700",
    },
  });

  const handleBackdropPress = () => {
    if (isConfirmation) {
      cancel();
    } else {
      hide();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleBackdropPress}
        accessibilityLabel="Close alert"
      >
        <Pressable
          style={styles.card}
          onPress={(event) => event.stopPropagation()}
        >
          {!isConfirmation && (
            <Pressable
              onPress={hide}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons
                name="close"
                size={r.ms(18)}
                color={Theme.colors.text}
              />
            </Pressable>
          )}

          <View
            style={[
              styles.iconContainer,
              { backgroundColor: config.background },
            ]}
          >
            <Ionicons name={config.icon} size={r.ms(35)} color={config.color} />
          </View>

          <Text style={styles.title}>{title || config.defaultTitle}</Text>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {isConfirmation && (
              <Pressable
                onPress={cancel}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryButton,
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Text style={styles.secondaryButtonText}>{cancelText}</Text>
              </Pressable>
            )}

            <Pressable
              onPress={isConfirmation ? accept : hide}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isConfirmation ? confirmText : "Got it"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
