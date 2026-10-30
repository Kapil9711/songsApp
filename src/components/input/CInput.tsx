import { Theme } from "@/themes/theme.context";
import React, { ReactElement, ReactNode } from "react";
import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface InputStyles {
  container?: StyleProp<ViewStyle>;
  input?: StyleProp<ViewStyle>;
  textInput?: StyleProp<TextStyle>;
  error?: StyleProp<TextStyle>;
}

interface InputProps<
  C extends React.ElementType = typeof TextInput,
> extends Omit<TextInputProps, "defaultValue" | "onChangeText"> {
  name: string;
  control: any;
  rules?: UseControllerProps<FieldValues>["rules"];
  styles?: InputStyles;
  rightItem?: ReactNode;
  children?: ReactElement<React.ComponentProps<C>>;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
}

const Input = <C extends React.ElementType = typeof TextInput>({
  name,
  control,
  rules = {},
  styles = {},
  rightItem,
  defaultValue = "",
  onChangeText,
  children,
  ...restProps
}: InputProps<C>) => {
  const theme = Theme();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View style={[theme.styles.mb4, styles.container]}>
          <View
            style={[
              theme.styles.row,
              theme.styles.TextInput,
              styles.input,
              error && {
                borderColor: theme.colors.danger,
              },
              { position: "relative" },
            ]}
          >
            {children ? (
              React.cloneElement(children, {
                value,
                onBlur,
                onChangeText: (text: string) => {
                  onChange(text);
                  onChangeText?.(text);
                },
                ...restProps,
              } as React.ComponentProps<C>)
            ) : (
              <TextInput
                {...restProps}
                style={[
                  theme.styles.col.grow,
                  theme.styles.p0,
                  {
                    color: theme.colors.text,
                  },
                  styles.textInput,
                  restProps.style,
                ]}
                placeholderTextColor={theme.colors.neutral300}
                value={value}
                onBlur={onBlur}
                onChangeText={(text) => {
                  onChange(text);
                  onChangeText?.(text);
                }}
              />
            )}
            {rightItem}
          </View>

          {error && (
            <Text
              style={[
                theme.styles.text.danger,
                theme.styles.mt2,
                theme.styles.mx2,
                styles.error,
              ]}
            >
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};

export default Input;
