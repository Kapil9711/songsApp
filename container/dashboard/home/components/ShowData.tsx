import { View, Text } from "react-native";
import React from "react";
import HorizontalList from "./HorizontalList";
import { useBackgroudImage } from "@/providers/BackgroundImage";
import { useAudioContext } from "@/providers/AudioProvider";
import { H3, H4 } from "tamagui";

const ShowData = ({
  data,
  heading,
  type = "song",
}: {
  data: any;
  heading: string;
  type: string;
}) => {
  return (
    <View style={{ gap: 9 }}>
      <Heading heading={heading} />
      <HorizontalList data={data} type={type} />
    </View>
  );
};

const Heading = ({ heading }: { heading: string }) => {
  return (
    <H4
      style={{
        paddingLeft: 10,
      }}
      color={"white"}
    >
      {heading}{" "}
    </H4>
  );
};

export default ShowData;
