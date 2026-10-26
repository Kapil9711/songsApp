import { InsetStyle, SafeSide, useInsetStyles } from "@/hooks/useInsetStyle";
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
  const safeAreaStyle = useInsetStyles(insetStyle || SafeSide);
  return (
    <View
      style={[
        {
          flex: 1,
          width: "100%",
          maxWidth: 600,
          alignSelf: "center",
          backgroundColor: "transparent",
        },
        [safeAreaStyle],
        style,
      ]}
    >
      {children}
    </View>
  );
};
