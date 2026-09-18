// Used to produce a bouncing animation when ressources are loading in the background

import React from "react";
import { View, Text, Image } from "react-native";

export default function Splash(){

    return(
        <View className = "flex-1 flex-col items-center justify-center gap-10">
            <Image style = {{
                height : 150,
                width : 180
                }}
                source = {require("../../assets/animations/layerCopy.png")}
            />
            <Text className="text-graphite font-bold text-2xl text-center text-pretty">My Wardrobe</Text>
        </View>
    )
}