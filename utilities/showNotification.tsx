import { useEffect } from "react";

import * as Notifications from "expo-notifications";
import * as FileSystem from "expo-file-system";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true, // Show pop-up alert even when app is open
//     shouldPlaySound: true, // Play sound if enabled
//     shouldSetBadge: false, // Optional: Set app icon badge count
//   }),
// });

const useNotification = () => {
  // Function to request notification permissions
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to show notifications is required!");
    }
  };

  useEffect(() => {
    // Request permissions when the app is launched
    requestNotificationPermissions();
    // Add a listener for incoming notifications (optional)
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received!", notification);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Function to show the "Now Playing" notification
  const showNowPlayingNotification = async (
    title: string,
    imageUrl: string
  ) => {
    // Check if permissions are granted
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      console.log("No notification permissions");
      return;
    }

    console.log(status, "permisionGranted");

    const imageUri = await downloadImage(imageUrl);
    const imageBase64 = await convertImageToBase64(imageUri);

    // Create the notification content
    const content = {
      title: `Now Playing: ${title}`, // Title of the song
      body: "Tap to play or pause", // Message
      data: { screen: "NowPlaying" }, // Custom data (you can use this to navigate later)
      android: {
        // Customization for Android
        channelId: "default", // Make sure you create a channel for Android
        smallIcon: "ic_notification", // You should provide an icon for the notification
        largeIcon: imageBase64, // You can use the song's album artwork for a larger icon
        priority: Notifications.AndroidNotificationPriority.HIGH, // Make sure it’s high priority
      },
      ios: {
        sound: true, // Make sound play on iOS
      },
    };

    console.log(content, "this is the content");

    // Show the notification
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: null, // This will show it immediately
    });
  };

  return { showNowPlayingNotification };
};

const downloadImage = async (imageUrl: string) => {
  const fileUri = FileSystem.cacheDirectory + "temp_image.jpg";
  const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
  return uri;
};

async function convertImageToBase64(fileUri: any) {
  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/png;base64,${base64}`; // Ensure proper format
  } catch (error) {
    console.error("Error converting image to Base64:", error);
    return null;
  }
}

// async function scheduleNotification() {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "Music Player",
//       body: "Playing audio in the background",
//     },
//     trigger: { seconds: 1, repeats: true } as any, // Trigger every 60 seconds
//   });
// }

// Call this function when your app starts
// scheduleNotification();

export default useNotification;
