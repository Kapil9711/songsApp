import { colors } from "@/src/constants/theme";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type Loading = {
  showLoading?: boolean;

  title?: string;
};

export const CLoading = ({ title, showLoading = true }: Loading) => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingIcon}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>

      {showLoading && <Text style={styles.loadingTitle}>Loading...</Text>}

      {title && <Text style={styles.loadingSubtitle}>{title}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingBottom: 100,
  },

  loadingIcon: {
    width: 58,
    height: 58,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,
  },

  loadingTitle: {
    marginTop: 14,

    fontSize: 15,
    fontWeight: "600",

    color: colors.text,
  },

  loadingSubtitle: {
    marginTop: 4,

    fontSize: 12,

    color: colors.textMuted,
  },

  emptyContainer: {
    minHeight: 400,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 72,
    height: 72,

    borderRadius: 23,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,

    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",

    color: colors.text,
  },

  emptyDescription: {
    marginTop: 7,

    fontSize: 13,
    lineHeight: 19,

    textAlign: "center",

    color: colors.textMuted,
  },
});
