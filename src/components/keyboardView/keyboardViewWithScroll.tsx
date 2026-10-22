import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type KeyboardAvoidingViewProps,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface KeyboardViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  behavior?: KeyboardAvoidingViewProps["behavior"];
  keyboardVerticalOffset?: number;
  scrollEnabled?: boolean;
  scrollViewProps?: ScrollViewProps;
}

export default function KeyboardViewWithScroll({
  children,
  style,
  contentContainerStyle,
  behavior = Platform.OS === "ios" ? "padding" : "height",
  keyboardVerticalOffset = 0,
  scrollEnabled = true,
  scrollViewProps,
}: KeyboardViewProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
