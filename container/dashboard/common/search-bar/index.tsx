import { useGlobalContext } from "@/providers/GlobalProvider";
import React, { useState } from "react";
import { View } from "react-native";
import { Input } from "tamagui";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("arijit singh");
  const { handleSearch } = useGlobalContext();
  return (
    <View
      style={{ flex: 1 }}
      className=" flex-1 flex-row    justify-center items-center mr-10 "
    >
      <Input
        onChangeText={(value: string) => {
          setSearchQuery(value);
          handleSearch(value);
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
