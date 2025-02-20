import { setAuthHeader } from "@/network/api";
import { useGlobalContext } from "@/providers/GlobalProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button, Spinner } from "tamagui";
import axiosInstance from "../../../network/api";
import FriendCard from "@/container/dashboard/common/song-card/friendCard";
import { get } from "lodash";

const Friends = () => {
  const {
    isActionLoading,
    getFriends,
    getRequest,
    getUsers,
    active,
    setActive,
    user,
    friends,
    requests,
    users,
    sendFriendRequest,
    confirmFriendRequest,
    isLoading,
  } = useFriend();
  return (
    <View>
      <Header
        active={active}
        setActive={setActive}
        {...{ getFriends, getRequest, getUsers }}
      />
      {isLoading ? (
        <View
          style={{
            paddingTop: 150,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner
            style={{ height: 40, width: 40, scale: 1.6 }}
            size="large"
            color="#f5075e"
          />
        </View>
      ) : (
        <>
          {active === "explore" && (
            <ShowFriend
              isActionLoading
              type={"users"}
              data={users}
              sendFriendRequest={sendFriendRequest}
            />
          )}

          {active === "requests" && (
            <ShowFriend
              isActionLoading
              confirmFriendRequest={confirmFriendRequest}
              type={"requests"}
              data={requests}
              sendFriendRequest={sendFriendRequest}
            />
          )}
          {active === "friends" && (
            <ShowFriend
              type={"friends"}
              data={friends}
              sendFriendRequest={sendFriendRequest}
            />
          )}
        </>
      )}
    </View>
  );
};

const Header = ({
  active,
  setActive,
  getFriends,
  getRequest,
  getUsers,
}: any) => {
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
            onPress={() => {
              setActive("explore");
              getUsers();
            }}
            style={{
              backgroundColor: active == "explore" ? "#f5075e" : "white",
            }}
            color={active == "explore" ? "white" : "default"}
          >
            Explore
          </Button>
          <Button
            onPress={() => {
              setActive("friends");
              getFriends();
            }}
            style={{
              backgroundColor: active == "friends" ? "#f5075e" : "white",
            }}
            color={active == "friends" ? "white" : "default"}
          >
            Friends
          </Button>
          <Button
            onPress={() => {
              setActive("requests");
              getRequest();
            }}
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
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { setFriends: setGlobalFriend } = useGlobalContext();

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        await setAuthHeader();
        const { data } = await axiosInstance.get("/friend");
        const { data: request } = await axiosInstance.get("/friend/request");
        const { data: users } = await axiosInstance.get("/user/all");

        if (data.success) {
          setFriends(data.friends);
          setGlobalFriend(data.friends);
        }
        if (request.success) {
          setRequests(request.friendRequests);
        }
        if (users.success) {
          setUsers(users?.users);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    })();
  }, []);

  const getFriends = () => {
    setIsLoading(true);
    (async () => {
      try {
        await setAuthHeader();
        const { data } = await axiosInstance.get("/friend");
        if (data.success) {
          setFriends(data.friends);
          setGlobalFriend(data.friends);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    })();
  };
  const getUsers = () => {
    setIsLoading(true);
    (async () => {
      try {
        await setAuthHeader();
        const { data: users } = await axiosInstance.get("/user/all");

        if (users.success) {
          setUsers(users?.users);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    })();
  };

  const getRequest = () => {
    setIsLoading(true);
    (async () => {
      try {
        await setAuthHeader();
        const { data: request } = await axiosInstance.get("/friend/request");

        if (request.success) {
          setRequests(request.friendRequests);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    })();
  };
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       setIsLoading(true);
  //       await setAuthHeader();
  //       const { data } = await axiosInstance.get("/friend");
  //       if (data.success) {
  //         setFriends(data.friends);
  //       }
  //       setIsLoading(false);
  //     } catch (error) {
  //       setIsLoading(false);
  //     }
  //   })();
  // }, [isLoading, friends]);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       setIsLoading(true);
  //       await setAuthHeader();
  //       const { data: request } = await axiosInstance.get("/friend/request");

  //       if (request.success) {
  //         setRequests(request.friendRequests);
  //       }
  //       setIsLoading(false);
  //     } catch (error) {
  //       setIsLoading(false);
  //     }
  //   })();
  // }, [isLoading, requests]);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       setIsLoading(true);
  //       await setAuthHeader();
  //       const { data: users } = await axiosInstance.get("/user/all");

  //       if (users.success) {
  //         setUsers(users?.users);
  //       }
  //       setIsLoading(false);
  //     } catch (error) {
  //       setIsLoading(false);
  //     }
  //   })();
  // }, [isLoading, users]);

  const sendFriendRequest = async (data: any) => {
    const payload = { requester: user._id, recipient: data._id };
    try {
      const { data } = await axiosInstance.post("friend", payload);

      getFriends();
      getUsers();
      getRequest();
    } catch (error) {}
  };
  const confirmFriendRequest = async (id: string) => {
    try {
      const { data } = await axiosInstance.put("friend/" + id, {
        status: "accepted",
      });
      getFriends();
      getUsers();
      getRequest();
    } catch (error) {}
  };

  return {
    isActionLoading,
    user,
    active,
    setActive,
    friends,
    requests,
    users,
    sendFriendRequest,
    confirmFriendRequest,
    getFriends,
    getRequest,
    getUsers,
    isLoading,
  };
};

const ShowFriend = ({
  data,
  sendFriendRequest,
  type,
  confirmFriendRequest,
  isActionLoading,
}: any) => {
  return (
    <View style={{ paddingBottom: 180 }}>
      <ScrollView>
        <View style={{ flex: 1, gap: 20, paddingTop: 10, paddingBottom: 180 }}>
          {data.map((item: any, idx: number) => {
            return (
              <FriendCard
                isActionLoading={isActionLoading}
                confirmFriendRequest={confirmFriendRequest}
                type={type}
                sendFriendRequest={sendFriendRequest}
                index={idx}
                key={item._id}
                data={item}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default Friends;
