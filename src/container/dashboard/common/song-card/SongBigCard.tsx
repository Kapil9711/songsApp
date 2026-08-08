import { View, Text } from "react-native";
import React from "react";
import { Button, Card, H2, H4, Paragraph, XStack } from "tamagui";
import { Image } from "react-native";

const SongBigCard = ({
  image,
  type = "song",
  title,
}: {
  image: string;
  type?: string;
  title: string;
}) => {
  return (
    <View>
      <Card elevate size="$2" bordered width={120} height={120}>
        <Card.Header padded>
          {/* <Paragraph theme="alt2">Now available</Paragraph> */}
        </Card.Header>
        <Card.Footer>
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              height: 25,
              paddingHorizontal: 5,
              justifyContent: "center",
            }}
          >
            <Paragraph>{title?.slice(0, 15)}</Paragraph>
          </View>
          {/* <Button borderRadius="$10">Purchase</Button> */}
        </Card.Footer>
        <Card.Background>
          <View style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Background Image */}
            <Image
              source={{ uri: image }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 4,
              }}
            />

            {/* Overlay View */}
            <View
              style={{
                // Makes overlay cover entire image
                backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark overlay with 50% opacity
                borderRadius: 4, // Match image border radius
              }}
            />
          </View>
        </Card.Background>
      </Card>
    </View>
  );
};

export default SongBigCard;
