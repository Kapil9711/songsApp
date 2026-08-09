import AsyncStorage from "@react-native-async-storage/async-storage";
import * as fileSystem from "expo-file-system";

import * as MediaLibrary from "expo-media-library";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";

import * as FileSystem from "expo-file-system";

export const RECENTLY_PLAYED_DIR = `${FileSystem.documentDirectory}recentlyPlayed/`;
export const SEARCH_SONG_DIR = `${FileSystem.documentDirectory}searchSong/`;

export const ensureDirectoryExists = async (path: string) => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(path);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(RECENTLY_PLAYED_DIR, {
        intermediates: true,
      });
      console.log("Created recentlyPlayed directory");
    }
    return true;
  } catch (error) {
    return false;
    console.error("Error ensuring directory exists:", error);
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

export const getDownloadedSongs = async () => {
  try {
    const files = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory as string,
    );

    const user: any = await getValueInAsync("user");

    const id = JSON.parse(user)?._id;

    // Get audio files belonging to the current user
    const audioFiles = files.filter(
      (file) => file.endsWith(`${id}.m4a`) || file.endsWith(`${id}.mp3`),
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
          {
            url: FileSystem.documentDirectory + file,
          },
        ],

        image: [
          "",
          "",
          {
            url: FileSystem.documentDirectory + baseName + ".jpg",
          },
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

export const downloadSong = async (
  songUrl: string,
  imageUrl: string,
  fileName: string,
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
      imageUri,
    );
    await imageDownload.downloadAsync();

    return { songUri, imageUri };
  } catch (error) {
    console.error("Error downloading song or image:", error);
    return null;
  }
};

export const exportToDownloads = async (
  fileUri?: string,
  fileName?: string,
) => {
  try {
    // Ask for media library permission
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission not granted to access media library");
      return null;
    }

    // Create custom folder in cache before moving to MediaLibrary
    const downloadsDir = FileSystem.cacheDirectory + "songsPro/";
    await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });

    // Function to copy + move to MediaLibrary
    const saveFile = async (sourceUri: string, name: string) => {
      const newPath = downloadsDir + name + ".mp3"; // rename to mp3
      await FileSystem.copyAsync({ from: sourceUri, to: newPath });

      const asset = await MediaLibrary.createAssetAsync(newPath);
      await MediaLibrary.createAlbumAsync("songsPro", asset, false);
      console.log("Exported:", newPath);
    };

    if (fileUri) {
      // Case 1: Single file export
      const safeName = fileName ?? Date.now().toString();
      await saveFile(fileUri, safeName);
    } else {
      // Case 2: Export ALL files in documentDirectory
      const files = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory!,
      );

      for (const f of files) {
        const sourceUri = FileSystem.documentDirectory + f;
        const name = f.split(".")[0]; // remove extension
        await saveFile(sourceUri, name);
      }
    }

    return true;
  } catch (error) {
    console.error("Error exporting files:", error);
    return null;
  }
};

export const exportSongToFolder = async (songUri: string, imageUri: string) => {
  try {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      return false;
    }

    const directoryUri = permissions.directoryUri;

    // Read files as base64
    const songBase64 = await FileSystem.readAsStringAsync(songUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const songName = songUri.split("/").pop()!;
    const imageName = imageUri.split("/").pop()!;

    const songFile = await FileSystem.StorageAccessFramework.createFileAsync(
      directoryUri,
      songName,
      "audio/mp4",
    );

    await FileSystem.writeAsStringAsync(songFile, songBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const imageFile = await FileSystem.StorageAccessFramework.createFileAsync(
      directoryUri,
      imageName,
      "image/jpeg",
    );

    await FileSystem.writeAsStringAsync(imageFile, imageBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return true;
  } catch (error) {
    console.error("Export failed:", error);
    return false;
  }
};

export const exportDownloadedSongs = async () => {
  try {
    // 1. Get downloaded songs
    const songs: any = await getDownloadedSongs();

    if (!songs.length) {
      console.log("No downloaded songs found");
      return false;
    }

    // 2. Ask user to select a folder
    const permission =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permission.granted) {
      console.log("Folder permission cancelled");
      return false;
    }

    const directoryUri = permission.directoryUri;

    // 3. Export every song + image
    for (const song of songs) {
      const songUri = song.downloadUrl?.[4]?.url;
      const imageUri = song.image?.[2]?.url;

      if (!songUri) {
        continue;
      }

      const songName = songUri.split("/").pop();

      if (!songName) {
        continue;
      }

      // Read song
      const songBase64 = await FileSystem.readAsStringAsync(songUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create song in selected folder
      const exportedSong =
        await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          songName,
          songName.endsWith(".mp3") ? "audio/mpeg" : "audio/mp4",
        );

      // Write song
      await FileSystem.writeAsStringAsync(exportedSong, songBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 4. Export corresponding image
      if (imageUri) {
        const imageName = imageUri.split("/").pop();

        if (imageName) {
          const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const exportedImage =
            await FileSystem.StorageAccessFramework.createFileAsync(
              directoryUri,
              imageName,
              "image/jpeg",
            );

          await FileSystem.writeAsStringAsync(exportedImage, imageBase64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      }
    }

    console.log("All songs exported successfully");

    return true;
  } catch (error) {
    console.error("Error exporting downloaded songs:", error);

    return false;
  }
};

export const importDownloadedSongs = async () => {
  try {
    const permission =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permission.granted) {
      console.log("Folder selection cancelled");
      return false;
    }

    const directoryUri = permission.directoryUri;

    const files =
      await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri);

    console.log("FILES:", files);

    let importedCount = 0;

    for (const fileUri of files) {
      try {
        /**
         * SAF returns something like:
         *
         * primary%3ADownload%2Fsongs%2FRaahi%20Manwa...m4a
         *
         * Decode it first.
         */
        const decodedUri = decodeURIComponent(fileUri);

        console.log("DECODED URI:", decodedUri);

        /**
         * Get everything after the last /
         */
        const fileName = decodedUri.split("/").pop();

        if (!fileName) {
          continue;
        }

        console.log("REAL FILE NAME:", fileName);

        const lowerName = fileName.toLowerCase();

        const isAudio =
          lowerName.endsWith(".m4a") || lowerName.endsWith(".mp3");

        const isImage =
          lowerName.endsWith(".jpg") ||
          lowerName.endsWith(".jpeg") ||
          lowerName.endsWith(".png");

        if (!isAudio && !isImage) {
          continue;
        }

        /**
         * IMPORTANT:
         * Use the REAL filename, not the encoded SAF path.
         */
        const destination = `${FileSystem.documentDirectory}${fileName}`;

        console.log("DESTINATION:", destination);

        const existing = await FileSystem.getInfoAsync(destination);

        if (existing.exists) {
          console.log("Already exists:", fileName);
          continue;
        }

        /**
         * Copy the original SAF URI.
         * Do NOT use decodedUri here.
         *
         * fileUri is the actual SAF URI that Android
         * understands.
         */
        await FileSystem.copyAsync({
          from: fileUri,
          to: destination,
        });

        const verify = await FileSystem.getInfoAsync(destination);

        if (verify.exists) {
          console.log("Successfully imported:", fileName);

          importedCount++;
        }
      } catch (fileError) {
        console.error("Error importing file:", fileUri, fileError);
      }
    }

    console.log(`Imported ${importedCount} files`);

    return importedCount > 0;
  } catch (error) {
    console.error("Error importing downloaded songs:", error);

    return false;
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
  fileName: string,
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
