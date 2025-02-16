import AsyncStorage from "@react-native-async-storage/async-storage";
import * as fileSystem from "expo-file-system";

import * as MediaLibrary from "expo-media-library";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";

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
    }
  } catch (error) {
    console.error("Error saving file:", error);
    throw new Error("Not");
  }
};

export const handleDownload = async (url: string, fileName: string) => {
  try {
    Toast.show({
      type: "success", // success | error | info
      text1: "Starting Download",
      text2: "File Will Download in Backgroun",
      visibilityTime: 2500,
      autoHide: true,
    });
    const uri = await downloadSong(url, fileName);
    console.log(uri, "uri");
    if (uri) {
      await saveToDevice(uri);
      Toast.show({
        type: "success", // success | error | info
        text1: "Downloaded Successfully",
        text2: "Your file has been saved!",
        visibilityTime: 2500,
        autoHide: true,
      });
    }
  } catch (error) {
    console.log(error);
    Toast.show({
      type: "error", // success | error | info
      text1: "Song not downloaded!",
      text2: "Some Error has Occured ",
      visibilityTime: 2500,
      autoHide: true,
    });
  }
};
