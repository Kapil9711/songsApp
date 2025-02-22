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
  H4,
  H5,
  H6,
  Input,
  Paragraph,
  Spinner,
} from "tamagui";

import { useAuthContext } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";

const SignIn = () => {
  const { form, setForm, handleLogin, isUserLoginPending } = useAuthContext();
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0, 0, 0,.9)",
        paddingTop: 30,
        alignItems: "center",
      }}
    >
      <View>
        <H2 color={"orange"} style={{ textAlign: "center" }}>
          Log-In
        </H2>
        <View style={{ gap: 20, marginTop: 20 }}>
          <View style={{ gap: 6, width: "100%" }}>
            <H6 color={"white"}>Email / UserName</H6>
            <Input
              style={{ width: "100%", fontSize: 18 }}
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

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Paragraph color={"white"}>Do Not Have An Account, </Paragraph>
            <TouchableOpacity
              onPress={() => {
                router.push("/(auth)/sign-up");
              }}
            >
              <H6 color={"orange"}>Sign-Up</H6>
            </TouchableOpacity>
          </View>

          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: -8,
            }}
          >
            {isUserLoginPending ? (
              <Spinner size="large" color={"white"} />
            ) : (
              <TouchableOpacity>
                <Button
                  onPress={() => {
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
