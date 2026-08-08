import React, { Children, createContext, useContext, useState } from "react";

const ImageBackgroudnContext = createContext(null as any);
export const useBackgroudImage = () => useContext(ImageBackgroudnContext);

const BackgroundImageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [image, setImage] = useState(
    "https://cdn.pixabay.com/photo/2023/02/06/17/34/lentils-7772450_1280.jpg"
  );
  return (
    <ImageBackgroudnContext.Provider value={{ setImage, image }}>
      {children}
    </ImageBackgroudnContext.Provider>
  );
};

export default BackgroundImageProvider;
