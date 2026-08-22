import { colors } from "@/src/constants/theme";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { usePathname } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "tamagui";
import { moderateScale } from "react-native-size-matters";

export const SearchBar = () => {
  const {
    handleSearch,
    handleLocalSearch,
    searchQuery,
    setSearchQuery,
    setPage,
  } = useGlobalContext();

  const pathname = usePathname();

  const handleChange = (value: string) => {
    if (pathname.includes("home")) {
      handleSearch(value);
      setPage(1);
    }

    if (pathname.includes("file")) {
      handleLocalSearch(value);
    }

    if (pathname.includes("favorites")) {
      handleLocalSearch(value, "favorites");
    }

    setSearchQuery(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        {/* Search Icon */}
        <Ionicons
          name="search-outline"
          size={26}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />

        {/* Search Input */}
        <Input
          unstyled
          value={searchQuery}
          onChangeText={handleChange}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />

        {/* Filter Icon */}
        <Ionicons
          name="options-outline"
          size={27}
          color={colors.primary}
          style={styles.filterIcon}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: moderateScale(6),
  },

  searchBar: {
    height: moderateScale(50),
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    opacity: 0.85,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 100,
    paddingHorizontal: 18,
  },

  searchIcon: {
    marginRight: 14,
  },

  input: {
    flex: 1,

    height: "100%",

    paddingHorizontal: 0,
    paddingVertical: 0,

    margin: 0,

    backgroundColor: "transparent",

    borderWidth: 0,
    borderColor: "transparent",

    color: colors.text,

    fontSize: 16,

    // outlineWidth: 0,
  },

  filterIcon: {
    marginLeft: 12,
  },
});
