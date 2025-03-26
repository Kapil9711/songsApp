import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";

const NotFoundScreen = () => {
  useEffect(() => {
    if (router) {
      if (router.canGoBack()) {
        router.back();
      }
    }
  });
  return (
    <View>
      <Text>NotFoundScreen</Text>
    </View>
  );
};

export default NotFoundScreen;
