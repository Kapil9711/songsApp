import React from "react";
import {
  Dimensions,
  Text,
  View,
  TextInput,
  Pressable,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  ButtonFrame,
  H2,
  H3,
  H5,
  H6,
  Input,
  Paragraph,
  Spinner,
} from "tamagui";

import { useAuthContext } from "@/providers/AuthProvider";

const SignIn = () => {
  const { form, setForm, handleLogin, isUserLoginPending } = useAuthContext();
  console.log(form, "fsfd");
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ff268b",
        paddingTop: 150,
        alignItems: "center",
      }}
    >
      <View>
        <H2 color={"white"} style={{ textAlign: "center" }}>
          Sign-In
        </H2>
        <View style={{ gap: 20, marginTop: 20 }}>
          <View style={{ gap: 4 }}>
            <H6 color={"white"}>Email / UserName</H6>
            <Input
              style={{ width: 290, fontSize: 18 }}
              onChangeText={(value: string) => {
                setForm((prev: any) => {
                  return { ...prev, userId: value };
                });
              }}
            />
          </View>

          <View style={{ gap: 4 }}>
            <H6 color={"white"}>Password</H6>

            <Input
              style={{ width: 290, fontSize: 18 }}
              onChangeText={(value: string) => {
                setForm((prev: any) => {
                  return { ...prev, password: value };
                });
              }}
            />
          </View>

          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            {isUserLoginPending ? (
              <Spinner size="large" color={"white"} />
            ) : (
              <TouchableOpacity>
                <Button
                  onPress={() => {
                    console.log("clicked");
                    handleLogin();
                  }}
                  style={{ width: 100, backgroundColor: "white", fontSize: 20 }}
                >
                  Submit
                </Button>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default SignIn;
