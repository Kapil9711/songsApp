import { useEffect, useState } from "react";

export const useLoading = (time: number = 100) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(false);
    }, time);
    return () => {
      clearTimeout(id);
    };
  }, [time]);

  return loading;
};
