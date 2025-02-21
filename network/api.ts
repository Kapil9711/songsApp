import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
//https://song-backend-two.vercel.app/
// "https://songspro.vercel.app/api/v1"
// Create an Axios instance with a base URL
// 192.168.31.250
// https://song-backend-two.vercel.app/
const api = axios.create({
  baseURL: "http://192.168.31.250:8001", // Your base API URL
  headers: {
    "Content-Type": "application/json", // Default headers
  },
});

// Function to get the token from AsyncStorage and set the Authorization header
export const setAuthHeader = async () => {
  try {
    const token = await AsyncStorage.getItem("token"); // Retrieve token from AsyncStorage
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`; // Set the token in the Authorization header
    } else {
      api.defaults.headers["Authorization"] = ""; // If there's no token, set Authorization as empty
    }
  } catch (error) {
    console.error("Error retrieving token from AsyncStorage", error);
  }
};

// Call this function to set the token before making API calls
setAuthHeader();

export default api;
