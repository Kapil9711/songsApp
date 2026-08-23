// import React from "react";
// import { Pressable, StyleSheet } from "react-native";
// import { Menu } from "lucide-react-native";
// import { useNavigation } from "expo-router";
// import { DrawerActions } from "@react-navigation/native";

// const DrawerButton = () => {
//   const navigation = useNavigation();

//   const openDrawer = () => {
//     navigation.dispatch(DrawerActions.openDrawer());
//   };

//   return (
//     <Pressable
//       onPress={openDrawer}
//       style={({ pressed }) => [styles.button, pressed && styles.pressed]}
//     >
//       <Menu size={22} color="#FFFFFF" />
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   button: {
//     width: 42,
//     height: 42,
//     borderRadius: 12,

//     alignItems: "center",
//     justifyContent: "center",

//     backgroundColor: "#1C1C20",

//     borderWidth: 1,
//     borderColor: "#27272A",
//   },

//   pressed: {
//     backgroundColor: "#A855F7",
//   },
// });

// export default DrawerButton;
