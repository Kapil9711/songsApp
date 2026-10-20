import { Container } from "@/components/container";
import { useTheme } from "@/themes/theme.context";
import { Text, View } from "react-native";

export default function HomeScreen() {
  const { Theme } = useTheme();

  return (
    <Container style={{ maxWidth: "100%" }}>
      <View>
        <Text style={[Theme.styles.H4, { color: Theme.colors.primary }]}>
          Home Screen
        </Text>
      </View>
    </Container>
  );
}
