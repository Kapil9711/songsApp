import { StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101010",
    padding: 20,
  },
  title: {
    color: "#C5FF4A",
    fontSize: 20,
    fontWeight: "700",
  },
});
