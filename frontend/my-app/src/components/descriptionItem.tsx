// Description on the bottom of the feed screen of a given item

import { View, Text, Image } from "react-native";
import React from "react";
import { DescriptionContent } from "../types/feed";

export default function DescriptionItem({url, description, username} : DescriptionContent){
    return(
        <View className = "absolute flex-col left-0 right-0 bottom-10 align-top m-10">
            <View className="flex-1 flex-row gap-4">
                <Image source = {{uri : `data:image/png;base64,${url}`}}/>
                <Text className="font-bold text-xl text-white">{username}</Text>
            </View>
            <Text className="text-white text-base">{description}</Text>
        </View>
    );
}