import { View } from "react-native";
import React from "react";
import { Slot } from "expo-router";
import BackgroundImageProvider from "@/src/providers/BackgroundImage";

import BottomHeader from "@/src/container/dashboard/common/bottom-header";
import AudioProvider from "@/src/providers/AudioProvider";
import AudioPlayer from "@/src/container/dashboard/common/audio-player";
import GlobalProvider from "@/src/providers/GlobalProvider";
import SocketProvider from "@/src/providers/socketProvider";
import { PlayerProvider } from "@/src/providers/PlaterProvider";

const DashboardLayout = () => {
  return (
    <SocketProvider>
      <BackgroundImageProvider>
        <BackgroundImageWrapper>
          <AudioProvider>
            <GlobalProvider>
              <PlayerProvider>
                {/* <Toast /> */}
                {/* <RightDrawer /> */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,.6)",
                  }}
                >
                  <Slot />
                  <AudioPlayer />
                  <BottomHeader />
                </View>
              </PlayerProvider>
            </GlobalProvider>
          </AudioProvider>
        </BackgroundImageWrapper>
      </BackgroundImageProvider>
    </SocketProvider>
  );
};

// const BackgroundImageWrapper = ({ children }: { children: any }) => {
//   const { image } = useBackgroudImage();
//   return (
//     <ImageBackground
//       style={{
//         display: "flex",
//         flex: 1,
//         backgroundSize: "cover",
//         backgroundColor: "rgba(0, 0, 0, .7)",
//       }}
//       source={{ uri: image }}
//     >
//       {children}
//     </ImageBackground>
//   );
// };

import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import ImageColors from "react-native-image-colors";
import BackgroundImageWrapper from "@/src/container/dashboard/common/background";

const DEFAULT_BACKGROUND = "#0A0A0B";

// const BackgroundImageWrapper = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const { image } = useBackgroudImage();

//   const [gradientColors, setGradientColors] = useState({
//     dominant: "#1C1C20",
//     secondary: "#0A0A0B",
//   });

//   /*
//    * Create Animated.Value only once.
//    *
//    * IMPORTANT:
//    * Do not call animation.setValue().
//    */
//   const animation = useMemo(() => {
//     return new Animated.Value(0);
//   }, []);

//   /*
//    * Extract colors from current song artwork
//    */
//   useEffect(() => {
//     if (!image) {
//       setGradientColors({
//         dominant: "#1C1C20",
//         secondary: "#0A0A0B",
//       });

//       return;
//     }

//     let cancelled = false;

//     const extractColors = async () => {
//       try {
//         const result: any = await ImageColors.getColors(image, {
//           fallback: DEFAULT_BACKGROUND,
//           cache: true,
//           key: image,
//         });

//         console.log("IMAGE COLORS:", result);

//         if (cancelled) return;

//         let dominant = DEFAULT_BACKGROUND;

//         if (result.platform === "android") {
//           dominant =
//             result.dominant ||
//             result.vibrant ||
//             result.darkVibrant ||
//             result.lightVibrant ||
//             result.muted ||
//             DEFAULT_BACKGROUND;
//         } else {
//           dominant =
//             result.background ||
//             result.primary ||
//             result.secondary ||
//             result.detail ||
//             DEFAULT_BACKGROUND;
//         }

//         setGradientColors({
//           dominant,
//           secondary: darkenColor(dominant, 0.45),
//         });
//       } catch (error) {
//         console.log("Failed to extract image colors:", error);

//         if (!cancelled) {
//           setGradientColors({
//             dominant: DEFAULT_BACKGROUND,
//             secondary: DEFAULT_BACKGROUND,
//           });
//         }
//       }
//     };

//     extractColors();

//     return () => {
//       cancelled = true;
//     };
//   }, [image]);

//   /*
//    * Continuous fluid animation
//    */
//   useEffect(() => {
//     const loop = Animated.loop(
//       Animated.timing(animation, {
//         toValue: 1,
//         duration: 18000,
//         easing: Easing.inOut(Easing.sin),
//         useNativeDriver: false,
//       }),
//     );

//     loop.start();

//     return () => {
//       loop.stop();
//     };
//   }, [animation]);

//   /*
//    * Main glow position
//    */
//   const mainCx = animation.interpolate({
//     inputRange: [0, 0.25, 0.5, 0.75, 1],
//     outputRange: ["65%", "80%", "72%", "55%", "65%"],
//   });

//   const mainCy = animation.interpolate({
//     inputRange: [0, 0.25, 0.5, 0.75, 1],
//     outputRange: ["0%", "8%", "18%", "6%", "0%"],
//   });

//   /*
//    * Secondary glow position
//    */
//   const secondaryCx = animation.interpolate({
//     inputRange: [0, 0.25, 0.5, 0.75, 1],
//     outputRange: ["-5%", "12%", "2%", "-10%", "-5%"],
//   });

//   const secondaryCy = animation.interpolate({
//     inputRange: [0, 0.25, 0.5, 0.75, 1],
//     outputRange: ["90%", "78%", "68%", "82%", "90%"],
//   });

//   return (
//     <View style={styles.container}>
//       <Svg
//         width="100%"
//         height="100%"
//         style={StyleSheet.absoluteFillObject}
//         pointerEvents="none"
//       >
//         <Defs>
//           {/* Main fluid glow */}
//           <RadialGradient
//             id="mainGlow"
//             cx={mainCx as any}
//             cy={mainCy as any}
//             rx="80%"
//             ry="65%"
//           >
//             <Stop
//               offset="0%"
//               stopColor={gradientColors.dominant}
//               stopOpacity={0.7}
//             />

//             <Stop
//               offset="30%"
//               stopColor={gradientColors.dominant}
//               stopOpacity={0.4}
//             />

//             <Stop
//               offset="60%"
//               stopColor={gradientColors.secondary}
//               stopOpacity={0.16}
//             />

//             <Stop
//               offset="100%"
//               stopColor={DEFAULT_BACKGROUND}
//               stopOpacity={0}
//             />
//           </RadialGradient>

//           {/* Secondary fluid glow */}
//           <RadialGradient
//             id="secondaryGlow"
//             cx={secondaryCx as any}
//             cy={secondaryCy as any}
//             rx="65%"
//             ry="55%"
//           >
//             <Stop
//               offset="0%"
//               stopColor={gradientColors.dominant}
//               stopOpacity={0.28}
//             />

//             <Stop
//               offset="40%"
//               stopColor={gradientColors.secondary}
//               stopOpacity={0.14}
//             />

//             <Stop
//               offset="100%"
//               stopColor={DEFAULT_BACKGROUND}
//               stopOpacity={0}
//             />
//           </RadialGradient>
//         </Defs>

//         {/* Base */}
//         <Rect width="100%" height="100%" fill={DEFAULT_BACKGROUND} />

//         {/* Main moving glow */}
//         <Rect width="100%" height="100%" fill="url(#mainGlow)" />

//         {/* Secondary moving glow */}
//         <Rect width="100%" height="100%" fill="url(#secondaryGlow)" />
//       </Svg>

//       {children}
//     </View>
//   );
// };

// const darkenColor = (hex: string, amount: number): string => {
//   try {
//     const cleanHex = hex.replace("#", "");

//     const r = parseInt(cleanHex.substring(0, 2), 16);
//     const g = parseInt(cleanHex.substring(2, 4), 16);
//     const b = parseInt(cleanHex.substring(4, 6), 16);

//     const newR = Math.round(r * (1 - amount));
//     const newG = Math.round(g * (1 - amount));
//     const newB = Math.round(b * (1 - amount));

//     return `#${newR.toString(16).padStart(2, "0")}${newG
//       .toString(16)
//       .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
//   } catch {
//     return DEFAULT_BACKGROUND;
//   }
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: DEFAULT_BACKGROUND,
//   },
// });

export default DashboardLayout;
