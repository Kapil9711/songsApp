import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

const useSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  return { searchQuery, setSearchQuery, router };
};

export default useSearchBar;
