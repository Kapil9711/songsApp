import React from "react";
import { TextInput, View, StyleSheet } from "react-native";
// Import your colors for consistency
import { Input } from "tamagui";
import useSearchBar from "./hook";

export const SearchBar = () => {
  const { searchQuery, setSearchQuery, router } = useSearchBar();
  return (
    <View
      style={{ flex: 1 }}
      className=" flex-1 flex-row    justify-center items-center mr-10 "
    >
      <Input
        onChangeText={(value) => {
          setSearchQuery(value as any);
        }}
        placeholder="Search songs..."
        value={searchQuery}
        flex={1}
        style={{ fontSize: 15 }}
        size={"large"}
      />
    </View>
  );
};
