// src/utils/backgroundTask.js
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

const BackgroundFetch1: any = BackgroundFetch;

// Define your background task
const BACKGROUND_TASK = "background-audio-task";

TaskManager.defineTask(BACKGROUND_TASK, async () => {
  try {
    // Your logic here to ensure the app stays alive
    // For example, you can check if audio is playing and resume it
    console.log("Background task is running");
    return BackgroundFetch1.Result.NewData;
  } catch (error) {
    console.error("Error in background task:", error);
    return BackgroundFetch1.Result.Failed;
  }
});

// Register the background task
export const registerBackgroundTask = async () => {
  try {
    await BackgroundFetch1.registerTaskAsync(BACKGROUND_TASK, {
      minimumInterval: 60 * 15, // Every 15 minutes (the minimum for background fetch)
      stopOnTerminate: false, // Keeps running after app termination
      startOnBoot: true, // Starts when the device is rebooted
    });
  } catch (error) {
    console.error("Failed to register background task:", error);
  }
};
