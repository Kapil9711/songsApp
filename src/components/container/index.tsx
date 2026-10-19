import { InsetStyle, SafeSide, useInsetStyles } from "@/hooks/useInsetStyle";
import { useTheme } from "@/themes/theme.context";
import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";

export const Container = ({
  insetStyle,
  children,
  style = {},
}: {
  insetStyle?: InsetStyle;
  children: ReactNode;
  style?: ViewStyle;
}) => {
  const { Theme } = useTheme();
  const safeAreaStyle = useInsetStyles(insetStyle || SafeSide);
  return (
    <View
      style={[
        { flex: 1, backgroundColor: Theme.colors.background },
        [safeAreaStyle],
        style,
      ]}
    >
      {children}
    </View>
  );
};
