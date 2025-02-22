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
import { useRouter } from "expo-router";

const SignUp = () => {
  const { form, setForm, isUserRegisterPending, handleRegister } =
    useAuthContext();
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,.95)",
        paddingTop: 30,
        alignItems: "center",
      }}
    >
      <View>
        <H2 color={"orange"} style={{ textAlign: "center" }}>
          Sign-Up
        </H2>
        <View style={{ gap: 12, marginTop: 15 }}>
          <View style={{ gap: 4 }}>
            <H6 color={"white"}>Email</H6>
            <Input
              style={{ width: 290, fontSize: 18 }}
              onChangeText={(value: string) => {
                setForm((prev: any) => {
                  return { ...prev, email: value };
                });
              }}
            />
          </View>

          <View style={{ gap: 4 }}>
            <H6 color={"white"}>Name</H6>
            <Input
              style={{ width: 290, fontSize: 18 }}
              onChangeText={(value: string) => {
                setForm((prev: any) => {
                  return { ...prev, name: value };
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
            <Paragraph color={"white"}>Already Have An Account, </Paragraph>
            <TouchableOpacity
              onPress={() => {
                router.push("/(auth)/sign-in");
              }}
            >
              <H6 color={"orange"}>Log-In</H6>
            </TouchableOpacity>
          </View>

          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            {isUserRegisterPending ? (
              <Spinner size="large" color={"white"} />
            ) : (
              <TouchableOpacity>
                <Button
                  onPress={() => {
                    handleRegister();
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

export default SignUp;
