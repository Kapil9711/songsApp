import { setAuthHeader } from "@/network/api";
import { useGlobalContext } from "@/providers/GlobalProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button } from "tamagui";
import axiosInstance from "../../../network/api";

const Friends = () => {
  const { active, setActive, user, friends, requests } = useFriend();
  return (
    <View>
      <Header active={active} setActive={setActive} />
      <ShowFriend data={friends} />
    </View>
  );
};

const Header = ({ active, setActive }: { active: string; setActive: any }) => {
  return (
    <View
      style={{
        height: 70,
        width: "100%",
        backgroundColor: "rgba(0,0,0,.7)",
        elevation: 16,
      }}
    >
      <ScrollView horizontal>
        <View
          style={{
            flexDirection: "row",
            gap: 20,
            height: "100%",
            alignItems: "center",
            position: "relative",
            left: 40,
            justifyContent: "center",
          }}
        >
          <Button
            onPress={() => setActive("explore")}
            style={{
              backgroundColor: active == "explore" ? "#f5075e" : "white",
            }}
            color={active == "explore" ? "white" : "default"}
          >
            Explore
          </Button>
          <Button
            onPress={() => setActive("friends")}
            style={{
              backgroundColor: active == "friends" ? "#f5075e" : "white",
            }}
            color={active == "friends" ? "white" : "default"}
          >
            Friends
          </Button>
          <Button
            onPress={() => setActive("requests")}
            style={{
              backgroundColor: active == "requests" ? "#f5075e" : "white",
            }}
            color={active == "requests" ? "white" : "default"}
          >
            Request
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const useFriend = () => {
  const [active, setActive] = useState("friends");
  const { user } = useGlobalContext();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        await setAuthHeader();
        const { data } = await axiosInstance.get("/friend");
        const { data: request } = await axiosInstance.get("/friend/request");
        if (data.success) {
          setFriends(data.friends);
        }
        if (request.success) {
          setRequests(request.friendRequests);
        }
      } catch (error) {
        console.log(error, "requests");
      }
    })();
  }, []);
  return { user, active, setActive, friends, requests };
};

const ShowFriend = ({ data }: any) => {
  return (
    <View>
      <ScrollView>
        <View style={{ flex: 1 }}>
          {data.map((item: any) => {
            return (
              <View>
                <Text>fdsfdjkfdsfjkdfkjdjkf</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default Friends;
