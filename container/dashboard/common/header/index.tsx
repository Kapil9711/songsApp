import { View, Text, StyleSheet, Touchable } from "react-native";
import React, { useState } from "react";
import { Avatar } from "react-native-paper";
import { Avatar as AvatarTamagui } from "tamagui";
import { SearchBar } from "../search-bar";
import { Drawer } from "react-native-paper";

const Header = () => {
  return (
    <View
      style={{
        backgroundColor: "white",
        height: 70,
        borderRadius: 4,
        elevation: 1,
      }}
      // className="h-[50px] text-white border-2 border-white bg-white"
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          paddingHorizontal: 15,
          paddingVertical: 8,
        }}
      >
        <AvatarTamagui circular size="$5">
          <AvatarTamagui.Image
            accessibilityLabel="Cam"
            src="https://images.unsplash.com/photo-1548142813-c348350df52b?&w=150&h=150&dpr=2&q=80"
          />
          <AvatarTamagui.Fallback backgroundColor="$blue10" />
        </AvatarTamagui>
        <SearchBar />
        <RightDrawer />
      </View>
    </View>
  );
};

import { TouchableOpacity, Dimensions, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons"; // Close Icon

const { height, width } = Dimensions.get("window"); // Get screen size

const RightDrawer = () => {
  const [open, setOpen] = useState(false);
  const translateX = useSharedValue(width); // Start fully hidden

  const openDrawer = () => {
    setOpen(true);
    translateX.value = withSpring(0); // Move drawer in
  };

  const closeDrawer = () => {
    translateX.value = withSpring(width, {}, () => {
      runOnJS(setOpen)(false); // Update state AFTER animation completes
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View>
      {/* Button to Open Drawer */}
      <TouchableOpacity onPress={openDrawer}>
        <Avatar.Icon
          icon={"hamburger"}
          color="black"
          style={{ backgroundColor: "white" }}
          size={50}
        />
      </TouchableOpacity>

      {/* Only show overlay when `open` is true */}
      {open && (
        <Pressable
          style={styles.overlay}
          onPress={closeDrawer}
          pointerEvents={open ? "auto" : "none"} // Prevent unwanted taps
        />
      )}

      {/* Right-Side Drawer */}
      <Animated.View style={[styles.drawer, animatedStyle]}>
        {/* Close Icon */}
        <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
          <Ionicons name="close" size={45} color="black" />
        </TouchableOpacity>

        {/* Drawer Content */}
        <Text style={styles.drawerText}>Right Drawer Content</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: { padding: 10, backgroundColor: "blue", borderRadius: 5 },
  buttonText: { color: "white", fontWeight: "bold" },

  /* Overlay to Close Drawer on Outside Click */
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)", // Semi-transparent overlay
    zIndex: 10, // Ensure it’s above everything except the drawer
  },

  /* Drawer Styling */
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    height: height, // Full height
    width: 250, // Drawer width
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 20,
    zIndex: 20, // Ensure drawer is on top of overlay
  },

  /* Close Icon Button */
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
  },

  drawerText: { fontSize: 18, fontWeight: "bold", marginTop: 40 },
});

export default Header;
