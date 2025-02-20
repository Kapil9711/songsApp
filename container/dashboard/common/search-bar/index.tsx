import { useGlobalContext } from "@/providers/GlobalProvider";
import { usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Input } from "tamagui";

export const SearchBar = () => {
  // const [searchQuery, setSearchQuery] = useState("arijit singh");
  const {
    handleSearch,
    handleLocalSearch,
    searchQuery,
    setSearchQuery,
    setPage,
  } = useGlobalContext();
  const pathname = usePathname();

  // useEffect(() => {
  //   setSearchQuery("");
  // }, [pathname]);
  return (
    <View
      style={{ flex: 1 }}
      className=" flex-1 flex-row  justify-center items-center mr-10"
    >
      <Input
        onChangeText={(value: string) => {
          if (pathname.includes("home")) {
            handleSearch(value);
            setPage(1);
          }
          if (pathname.includes("file")) handleLocalSearch(value);
          if (pathname.includes("favorites"))
            handleLocalSearch(value, "favorites");
          setSearchQuery(value);
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
