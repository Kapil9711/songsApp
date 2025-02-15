import React, { createContext, useContext } from "react";
import { Dimensions, Text, View, TextInput, Pressable } from "react-native";
import { Button, Spinner } from "tamagui";

import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "./hook";
import { blue } from "react-native-reanimated/lib/typescript/Colors";
const { height } = Dimensions.get("window");
const AuthContext = createContext(null as any);
const useAuthContext = () => {
  return useContext(AuthContext);
};

const AuthPage = () => {
  const authData = useAuth();
  const { isCheckingUserLogin } = authData;
  return (
    <AuthContext.Provider value={authData}>
      <SafeAreaView className="flex-1 bg-pink-100">
        {/* Remove unnecessary nested View with flex-1 */}

        <View style={{ height }} className="mt-28 items-center bg-pink-100">
          {isCheckingUserLogin ? (
            <View className="mt-60">
              <Spinner size="large" color="orange" />
            </View>
          ) : (
            <>
              <SignIn />
            </>
          )}
        </View>
      </SafeAreaView>
    </AuthContext.Provider>
  );
};

const SignIn = () => {
  const { form, setForm, handleLogin, isUserLoginPending } = useAuthContext();
  return (
    <View className="bg-pink-400 p-4 px-8  border-y-[7px] border-x-[3px] border-pink-700 h-[45%] w-[85%] rounded-xl">
      <Text className="text-center text-white text-3xl">Sign-In</Text>
      <View className="mt-12 flex gap-6">
        <View className="flex gap-3">
          <Text className="text-md tracking-wider text-white">
            Email / UserName
          </Text>
          <TextInput
            onChangeText={(value: string) => {
              setForm((prev: any) => {
                return { ...prev, userId: value };
              });
            }}
            className="border-y-[2px] text-gray-800 text-lg border-x-[4px] rounded-lg bg-white border-pink-700 "
          />
        </View>

        <View className="flex gap-3">
          <Text className="text-md tracking-wider text-white">Password</Text>
          <TextInput
            onChangeText={(value: string) => {
              setForm((prev: any) => {
                return { ...prev, password: value };
              });
            }}
            className="border-y-[2px] text-gray-800 text-lg border-x-[4px] rounded-lg bg-white border-pink-700 "
          />
        </View>

        <View className="flex items-center mt-4">
          {isUserLoginPending ? (
            <Spinner size="large" color={"white"} />
          ) : (
            <Pressable
              onPress={() => {
                console.log("clicked");
                handleLogin();
              }}
              className=" w-32 border-y-[2px] border-x-[7px] border-pink-700 bg-pink-600   flex items-center rounded-xl"
            >
              <Text className="py-3 text-white text-md">Submit</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const SignUp = () => {};

export default AuthPage;
