import React from "react";
import { Image, View, Text } from "react-native";
type Props = {
    image : string;
    name : string;
}

export default function ImageContainer({image, name} : Props){
    return(
        <View className="flex-1 flex-col bg-dusty-rose">
            <Image source = {{uri : image}} className="flex-1"/>
            <Text className="text-sm text-white text-bold">{name}</Text>
        </View>
    )
}