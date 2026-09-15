// Card used to render an item in the new outfit page on the bottom bar
import React from "react";
import { Text, View, Image } from "react-native";
import { useSession } from "../context/ctx";
import { Item } from "../types/cards";

type props = {
    item : Item
}

export default function ItemCardSmall({item} : props){
    return(
        <View className="flex-col p-4 bg-white rounded-lg">
            <Image source = {{uri : `data:image/png;base64,${item.image}`}} className="flex-1 w-full h-full rounded-2xl" />
            <Text className="font-bold text-graphite pt-2">{item.name}</Text>
        </View>
    )
}