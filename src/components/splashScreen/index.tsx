import { useTheme } from "@/themes/theme.context";
import { Image, View } from "react-native";
import { useResponsiveStyles } from "react-native-fluid-styles";

const SplashScreen = () => {
  const { Theme } = useTheme();

  const styles = useResponsiveStyles((r) => {
    return {
      container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        alignItems: "center",
        justifyContent: "center",
      },

      image: {
        width: "100%",
        height: "100%",
      },
    };
  });
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/splash-screen-4.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreen;
