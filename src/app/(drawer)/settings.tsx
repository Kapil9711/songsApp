import { Container } from "@/components/container";
import { SafeSide } from "@/hooks/useInsetStyle";
import { StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <Container insetStyle={{ ...SafeSide, top: false }}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
  },
  title: {
    color: "#C5FF4A",
    fontSize: 20,
    fontWeight: "700",
  },
});
