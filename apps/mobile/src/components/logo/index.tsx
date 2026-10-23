import { logo } from "@/assets";
import { Image } from "react-native";
import { moderateScale } from "react-native-fluid-styles";

export const Logo = () => {
  return (
    <Image
      source={logo}
      style={{ height: moderateScale(60), width: moderateScale(60) }}
    />
  );
};
