// Description on the bottom of the feed screen of a given item

import { View, Text } from "react-native";
import React from "react";
import { DescriptionContent } from "../types/feed";

export default function DescriptionItem({url, description, username} : DescriptionContent){
    return(
        <View className = "absolute left-0 right-0 bottom-10 align-top m-10">
            <Text className="font-bold text-xl text-white">{username}</Text>
            <Text className="text-white text-base">{description}</Text>
        </View>
    );
}