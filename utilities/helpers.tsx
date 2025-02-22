import AsyncStorage from "@react-native-async-storage/async-storage";
import * as fileSystem from "expo-file-system";

import * as MediaLibrary from "expo-media-library";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";

import * as FileSystem from "expo-file-system";

// export const getDownloadedSongs = async () => {
//   try {
//     const files = await fileSystem.readDirectoryAsync(
//       fileSystem.documentDirectory as string
//     );

//     // Filter only audio files (e.g., .mp3, .m4a)
//     const audioFiles = files.filter(
//       (file) => file.endsWith(".mp3") || file.endsWith(".m4a")
//     );

//     // Generate full file paths
//     const songList = audioFiles.map((file) => ({
//       filename: file,
//       uri: FileSystem.documentDirectory + file,
//     }));

//     return songList;
//   } catch (error) {
//     console.error("Error fetching downloaded songs:", error);
//     return [];
//   }
// };

export const getDownloadedSongs = async () => {
  try {
    const files = await fileSystem.readDirectoryAsync(
      fileSystem.documentDirectory as string
    );

    const user: any = await getValueInAsync("user");

    const id = JSON.parse(user)?._id;

    // Get audio files
    const audioFiles = files.filter(
      (file) => file.endsWith(`${id}.m4a`) || file.endsWith(`${id}.mp3`)
    );
    console.log(audioFiles, "files");

    // Create list with song details & corresponding images
    const songList = audioFiles.map((file, idx) => {
      const baseName = file.replace(/\.(m4a|mp3)$/, "");
      return {
        id: "fdfdsfd" + idx,
        downloadUrl: [
          "",
          "",
          "",
          "",
          { url: fileSystem.documentDirectory + file },
        ],
        image: [
          "",
          "",
          { url: fileSystem.documentDirectory + baseName + ".jpg" },
        ],
        name: baseName.split("_")[0],
      };
    });

    return songList;
  } catch (error) {
    console.error("Error fetching downloaded songs:", error);
    return [];
  }
};

export const setValueInAsync = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
};

export const getValueInAsync = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

// export const downloadSong = async (url: string, fileName: any) => {
//   try {
//     const fileUri = fileSystem.documentDirectory + fileName + ".m4a";
//     const downloadResumable = fileSystem.createDownloadResumable(url, fileUri);
//     const { uri }: any = await downloadResumable.downloadAsync();
//     return uri;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

export const downloadSong = async (
  songUrl: string,
  imageUrl: string,
  fileName: string
) => {
  try {
    const songUri = FileSystem.documentDirectory + fileName + ".m4a";
    const imageUri = FileSystem.documentDirectory + fileName + ".jpg"; // Save image with same name
    console.log(fileName, "name");
    // Download the song
    const songDownload = FileSystem.createDownloadResumable(songUrl, songUri);
    await songDownload.downloadAsync();

    // Download the image
    const imageDownload = FileSystem.createDownloadResumable(
      imageUrl,
      imageUri
    );
    await imageDownload.downloadAsync();

    return { songUri, imageUri };
  } catch (error) {
    console.error("Error downloading song or image:", error);
    return null;
  }
};

// export const saveToDevice = async (fileUri: string, title: string) => {
//   try {
//     // Request permissions
//     const { status } = await MediaLibrary.requestPermissionsAsync();
//     console.log(status, "status");

//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Denied",
//         "Storage permission is required to save files."
//       );
//       return;
//     }

//     // Check if running in Expo Go
//     const isExpoGo = true;

//     if (isExpoGo) {
//       // 🚀 Expo Go: Save to app storage (sandboxed)
//       let newFileUri = fileSystem.cacheDirectory + title + ".mp3";
//       await fileSystem.copyAsync({
//         from: fileUri,
//         to: newFileUri,
//       });
//     } else {
//       // 🚀 Standalone App: Save to Media Library (Music Folder)
//       let newFileUri =
//         Platform.OS === "android"
//           ? fileSystem.documentDirectory + title + ".mp3"
//           : fileSystem.documentDirectory + `Music/${title}.mp3`;
//       await fileSystem.copyAsync({
//         from: fileUri,
//         to: newFileUri,
//       });

//       // Save to Media Library
//       // const asset = await MediaLibrary.createAssetAsync(newFileUri);
//       // await MediaLibrary.createAlbumAsync("Music Downloads", asset, false);
//     }
//   } catch (error) {
//     console.error("Error saving file:", error);
//     throw new Error("Not");
//   }
// };

export const handleDownload = async (
  url: string,
  image: string,
  fileName: string
) => {
  try {
    Toast.show({
      type: "success", // success | error | info
      text1: "Starting Download",
      text2: "File Will Download in Backgroun",
      visibilityTime: 2500,
      autoHide: true,
    });
    const uri = await downloadSong(url, image, fileName);

    if (uri) {
      // await saveToDevice(uri, fileName);
      Toast.show({
        type: "success", // success | error | info
        text1: "Downloaded Successfully",
        text2: "Your file has been saved!",
        visibilityTime: 2500,
        autoHide: true,
      });
    }
  } catch (error) {
    Toast.show({
      type: "error", // success | error | info
      text1: "Song not downloaded!",
      text2: "Some Error has Occured ",
      visibilityTime: 2500,
      autoHide: true,
    });
  }
};

export const deleteFile = async (fileName: string) => {
  try {
    const songUri = fileSystem.documentDirectory + fileName + ".m4a";
    const imageUri = fileSystem.documentDirectory + fileName + ".jpg";
    const songInfo = await fileSystem.getInfoAsync(songUri);
    const imageInfo = await fileSystem.getInfoAsync(imageUri);
    if (songInfo.exists) {
      await fileSystem.deleteAsync(songUri);
    }
    if (imageInfo.exists) {
      await fileSystem.deleteAsync(imageUri);
    }
    Toast.show({
      type: "success", // success | error | info
      text1: "Deleted",
      text2: "File is Deleted Successfully",
      visibilityTime: 1500,
      autoHide: true,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};
