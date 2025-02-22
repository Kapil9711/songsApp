import { View, Text, StyleSheet, Touchable, Easing } from "react-native";
import React, { useEffect, useState } from "react";
import { Avatar } from "react-native-paper";
import {
  Avatar as AvatarTamagui,
  Button,
  H3,
  H6,
  Paragraph,
  Switch,
} from "tamagui";
import axiosInstance from "../../../../network/api";
import { SearchBar } from "../search-bar";
import { Drawer } from "react-native-paper";
const { height, width } = Dimensions.get("window");

const Header = () => {
  const currentPath = usePathname();

  return (
    <>
      {(currentPath.includes("home") || currentPath.includes("file")) && (
        <View
          style={{
            backgroundColor: "rgba(0,0,0,.1)",
            height: 70,
            borderRadius: 4,
            // elevation: 1,
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
            <Pressable>
              <AvatarTamagui circular size="$5">
                <AvatarTamagui.Image
                  accessibilityLabel="Cam"
                  src="https://res.cloudinary.com/deyhhkkmr/image/upload/v1739944680/uploads/zxnukungugjvhy3064ma.png"
                  // src="https://images.unsplash.com/photo-1548142813-c348350df52b?&w=150&h=150&dpr=2&q=80"
                  // src="/assets/images/icon3.png"
                />
                <AvatarTamagui.Fallback backgroundColor="$blue10" />
              </AvatarTamagui>
            </Pressable>

            <SearchBar />
            <View style={{ width: 40, height: 20 }}></View>
          </View>
        </View>
      )}
    </>
  );
};

import { TouchableOpacity, Dimensions, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons"; // Close Icon
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import { useGlobalContext } from "@/providers/GlobalProvider";
import { setValueInAsync } from "@/utilities/helpers";

export const RightDrawer = () => {
  const [open, setOpen] = useState(false);
  const translateX = useSharedValue(width); // Start fully hidden
  const router = useRouter();
  const { user } = useGlobalContext();
  const [isSwitchOn, setIsSwitchOn] = useState(user?.isFavouritePublic);

  useEffect(() => {
    setIsSwitchOn(user.isFavouritePublic);
  }, [user]);
  // const [user, setUser] = useState({} as any);
  const openDrawer = () => {
    setOpen(true);
    translateX.value = withTiming(0, {
      duration: 100,
    });
  };

  const updateUser = async (value: boolean) => {
    try {
      const { data } = await axiosInstance.put("/user", {
        isFavouritePublic: value,
      });
      if (data.success) {
        await setValueInAsync("user", JSON.stringify(data?.user));
      }
    } catch (error) {}
  };

  const onToggleSwitch = () => {
    setIsSwitchOn((prev: boolean) => {
      updateUser(!prev);
      return !prev;
    });
  };

  const closeDrawer = (type?: any) => {
    if (type === "cross") setOpen(false);
    translateX.value = withTiming(
      width,
      {
        duration: 100,
      },
      () => {
        runOnJS(setOpen)(false); // Hide overlay AFTER animation
      }
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // useEffect(() => {
  //   (async () => {
  //     const user = await AsyncStorage.getItem("user");
  //     if (user) {
  //       setUser(JSON.parse(user));
  //     }
  //   })();
  // }, []);

  return (
    <View style={{ zIndex: 1000, position: "absolute", right: 8, top: 0 }}>
      {/* Button to Open Drawer */}
      <Pressable onPress={openDrawer}>
        <Avatar.Icon
          icon={"menu"}
          color="black"
          style={{ backgroundColor: "white", marginTop: 9 }}
          size={50}
        />
      </Pressable>

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
        {/* <View>
          <TouchableOpacity
            onPress={() => closeDrawer("cross")}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={45} color="black" />
          </TouchableOpacity>
        </View> */}

        {/* Drawer Content */}
        <H3 style={{ textAlign: "center", marginBottom: 5 }}>{user?.name}</H3>
        <Button
          onPress={async () => {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            router.replace("/");
          }}
          size={"large"}
        >
          Logout
        </Button>

        <View style={{ marginTop: 4 }}>
          <Paragraph style={{ textAlign: "center" }}>User Setting</Paragraph>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Paragraph>Show Favorite To Friends</Paragraph>
            <Switch
              backgroundColor={isSwitchOn ? "#f5075e" : "white"}
              checked={isSwitchOn}
              onCheckedChange={onToggleSwitch}
              size="$3"
            >
              <Switch.Thumb animation="bouncy" />
            </Switch>
          </View>
          {/* <Pressable onPress={onToggleSwitch}>
            <Switch value={isSwitchOn} onValueChange={onToggleSwitch} />
          </Pressable> */}
        </View>
        {/* <Text style={styles.drawerText}>Right Drawer Content</Text> */}
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
    right: 0,
    width: width,
    height: height,
    backgroundColor: "rgba(0,0,0,0.7)", // Semi-transparent overlay
    zIndex: 10, // Ensure it’s above everything except the drawer
  },

  /* Drawer Styling */
  drawer: {
    position: "absolute",
    right: -20,
    top: 0,
    height: height, // Full height
    width: (width / 100) * 70, // Drawer width
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 20,
    zIndex: 50, // Ensure drawer is on top of overlay
  },

  /* Close Icon Button */
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
  },

  drawerText: { fontSize: 18, fontWeight: "bold", marginTop: 40 },
});

// import { Modal, Portal, PaperProvider } from "react-native-paper";

// const ShowModal = ({ visible, setVisible }: any) => {
//   const showModal = () => setVisible(true);
//   const hideModal = () => setVisible(false);
//   const containerStyle = {
//     backgroundColor: "white",
//     padding: 20,
//   };

//   return (
//     <View style={{ height, width, position: "absolute", top: 0 }}>
//       <PaperProvider>
//         <Portal>
//           <Modal
//             visible={visible}
//             onDismiss={hideModal}
//             contentContainerStyle={containerStyle}
//           >
//             <Text>
//               Example Modal. Click outside this area to
//               dismissjfjkdsfadajsfkdsjkfjkdfjkdjksfjkjksajkfdjkfjjksajkfkjdsjkjfaksfjkk.
//             </Text>
//             <Text>
//               Example Modal. Click outside this area to
//               dismissjfjkdsfadajsfkdsjkfjkdfjkdjksfjkjksajkfdjkfjjksajkfkjdsjkjfaksfjkk.
//             </Text>
//             <Text>
//               Example Modal. Click outside this area to
//               dismissjfjkdsfadajsfkdsjkfjkdfjkdjksfjkjksajkfdjkfjjksajkfkjdsjkjfaksfjkk.
//             </Text>
//             <Text>
//               Example Modal. Click outside this area to
//               dismissjfjkdsfadajsfkdsjkfjkdfjkdjksfjkjksajkfdjkfjjksajkfkjdsjkjfaksfjkk.
//             </Text>
//           </Modal>
//         </Portal>
//       </PaperProvider>
//     </View>
//   );
// };

export default Header;
