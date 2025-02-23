import { View, Text } from "react-native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import io from "socket.io-client";
import { Alert } from "react-native";
import { useGlobalContext } from "./GlobalProvider";
import { getValueInAsync } from "@/utilities/helpers";
const SocketProvder = createContext(null as any);
export const useSocket = () => useContext(SocketProvder);
// "http://192.168.106.102:5000"
const socketServerUrl = "https://socketserver-9jdt.onrender.com";

const SocketProvider = ({ children }: any) => {
  const [socket, setSocket] = useState(null as any);
  const [users, setUsers] = useState([] as any);
  //   const { setCurrentSong } = useGlobalContext();

  const requestToSync = useCallback(
    async (friendId: string) => {
      if (!friendId) {
        Alert.alert("Enter Friend's ID");
        return;
      }
      const user: any = await getValueInAsync("user");
      const userId = JSON.parse(user)?._id;

      socket.emit("requestSync", { senderId: userId, receiverId: friendId });
      Alert.alert("Request Sent", `Waiting for ${friendId} to accept...`);
    },
    [socket]
  );
  useEffect(() => {
    const newSocket = io(socketServerUrl);
    setSocket(newSocket);
    // connect request
    newSocket.on("connect", async () => {
      console.log("connected to server", newSocket.id);
      const user: any = await getValueInAsync("user");
      const userId = JSON.parse(user)?._id;
      if (userId) {
        newSocket.emit("join", userId);
      }
    });

    newSocket.on("users", ({ users }: any) => {
      console.log(users, "loog");
      setUsers(users);
    });

    const acceptSync = async (senderId: string) => {
      const user: any = await getValueInAsync("user");
      const userId = JSON.parse(user)?._id;
      console.log(userId, senderId);
      newSocket.emit("acceptSync", { senderId, receiverId: userId });
    };

    const rejectSync = async (senderId: string) => {
      const user: any = await getValueInAsync("user");
      const userId = JSON.parse(user);
      socket.emit("rejectSync", { senderId, receiverId: userId });
    };
    //syncRequest
    newSocket.on("syncRequest", ({ senderId }: { senderId: string }) => {
      Alert.alert(
        "Sync Request",
        `User ${senderId} wants to sync with your music. Accept?`,
        [
          { text: "Reject", onPress: () => rejectSync(senderId) },
          { text: "Accept", onPress: () => acceptSync(senderId) },
        ]
      );
    });

    // Request a friend to listen
  }, []);

  const value = useMemo(() => {
    return { socket, requestToSync, users };
  }, [socket, users]);

  return (
    <SocketProvder.Provider value={value}>{children}</SocketProvder.Provider>
  );
};

export default SocketProvider;
