import React, { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  StyleSheet,
} from "react-native";

type KeyboardViewProps = PropsWithChildren<
  Omit<KeyboardAvoidingViewProps, "behavior">
>;

const KeyboardView = ({ children, style, ...props }: KeyboardViewProps) => {
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default KeyboardView;
