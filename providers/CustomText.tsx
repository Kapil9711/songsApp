import React from "react";
import {
  Text as RNText,
  TextProps,
  TextInput as RNTextInput,
  TextInputProps,
} from "react-native";

// Custom Text Component
export const Text = (props: TextProps) => {
  return <RNText {...props} allowFontScaling={false} />;
};

// Custom TextInput Component
export const TextInput = (props: TextInputProps) => {
  return <RNTextInput {...props} allowFontScaling={false} />;
};
