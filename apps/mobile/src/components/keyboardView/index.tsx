import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  type KeyboardAvoidingViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface KeyboardViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  behavior?: KeyboardAvoidingViewProps["behavior"];
  keyboardVerticalOffset?: number;
}

export default function KeyboardView({
  children,
  style,
  behavior = Platform.OS === "ios" ? "padding" : "height",
  keyboardVerticalOffset = 0,
}: KeyboardViewProps) {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
