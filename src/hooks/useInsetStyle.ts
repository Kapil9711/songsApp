import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type InsetStyle = {
  right: boolean;
  left: boolean;
  top: boolean;
  bottom: boolean;
};

export const SafeSide: InsetStyle = {
  right: true,
  left: true,
  bottom: true,
  top: true,
};

export const useInsetStyles = ({
  right = true,
  left = true,
  top = true,
  bottom = true,
}: InsetStyle) => {
  const insets = useSafeAreaInsets();
  const insetsStyle = useMemo(() => {
    return StyleSheet.create({
      safeArea: {
        paddingTop: top ? insets.top : 0,
        paddingBottom: bottom ? Math.max(insets.bottom, 14) : 0,
        paddingLeft: left ? Math.max(insets.left, 14) : 0,
        paddingRight: right ? Math.max(insets.right, 14) : 0,
      },
    });
  }, [right, left, top, bottom]);
  return insetsStyle.safeArea;
};
