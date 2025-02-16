import AsyncStorage from "@react-native-async-storage/async-storage";
import * as fileSystem from "expo-file-system";

import * as MediaLibrary from "expo-media-library";
import { Alert, Platform } from "react-native";

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

export const downloadSong = async (url: string, fileName: any) => {
  try {
    const fileUri = fileSystem.documentDirectory + fileName + ".m4a";
    const downloadResumable = fileSystem.createDownloadResumable(url, fileUri);
    const { uri }: any = await downloadResumable.downloadAsync();
    return uri;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// export const convertToMp3 = async (m4aUri: string, fileName: string) => {
//   if (!ffmpeg.isLoaded()) {
//     await ffmpeg.load();
//   }

//   const inputFileName = "input.m4a";
//   const outputFileName = "output.mp3";

//   // Read the file as binary
//   const fileData = await fetchFile(m4aUri);
//   ffmpeg.FS("writeFile", inputFileName, fileData);

//   // Run FFmpeg command
//   await ffmpeg.run("-i", inputFileName, "-q:a", "2", outputFileName);

//   // Get the output file
//   const data = ffmpeg.FS("readFile", outputFileName);

//   // Write the MP3 file to the local filesystem
//   const mp3Uri = fileSystem.documentDirectory + fileName + ".mp3";
//   await fileSystem.writeAsStringAsync(mp3Uri, data, {
//     encoding: fileSystem.EncodingType.Base64,
//   });

//   return mp3Uri;
// };

// export const convertToMp3 = async (m4aUri: any, fileName: string) => {
//   const mp3Uri = fileSystem.documentDirectory + fileName + ".mp3";
//   const command = `-i ${m4aUri} -q:a 2 ${mp3Uri}`;
//   const result = await RNFFmpeg.execute(command);
//   if (result === 0) {
//     return mp3Uri;
//   } else return null;
// };

// export const saveToDevice = async (fileUri: any) => {
//   const { status } = await MediaLibrary.requestPermissionsAsync();
//   console.log(status, "status");
//   if (status === "granted") {
//     const asset = await MediaLibrary.createAssetAsync(fileUri);
//     await MediaLibrary.createAlbumAsync("Music Downloads", asset, false);
//     alert("Song saved to your Device");
//   } else {
//     alert("Storage permision is required");
//   }
// };

export const saveToDevice = async (fileUri: string) => {
  try {
    // Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    console.log(status, "status");

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Storage permission is required to save files."
      );
      return;
    }

    // Check if running in Expo Go
    const isExpoGo = true;

    if (isExpoGo) {
      // 🚀 Expo Go: Save to app storage (sandboxed)
      let newFileUri = fileSystem.cacheDirectory + "TeraChehra.mp3";
      await fileSystem.copyAsync({
        from: fileUri,
        to: newFileUri,
      });
      Alert.alert("Saved!", "Song saved in app storage (Expo Go sandbox).");
    } else {
      // 🚀 Standalone App: Save to Media Library (Music Folder)
      let newFileUri =
        Platform.OS === "android"
          ? fileSystem.documentDirectory + "TeraChehra.mp3"
          : fileSystem.documentDirectory + "Music/TeraChehra.mp3";

      await fileSystem.copyAsync({
        from: fileUri,
        to: newFileUri,
      });

      // Save to Media Library
      const asset = await MediaLibrary.createAssetAsync(newFileUri);
      await MediaLibrary.createAlbumAsync("Music Downloads", asset, false);
      Alert.alert("Success", "Song saved to Music Downloads!");
    }
  } catch (error) {
    console.error("Error saving file:", error);
    Alert.alert("Error", "Could not save the file.");
  }
};

export const handleDownload = async (url: string, fileName: string) => {
  try {
    console.log("starting");
    const uri = await downloadSong(url, fileName);
    console.log(uri, "uri");
    if (uri) {
      await saveToDevice(uri);
    }
  } catch (error) {
    console.log(error);
  }
};
