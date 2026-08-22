import React from "react";
import { Image } from "expo-image";
import { Pressable, Text, View, ImageSourcePropType } from "react-native";
import ImageViewer from "./outfitImage";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type Props = {
    image : ImageSourcePropType;
}

export default function Outfit({image} : Props){
    return(
        <View>
            <ImageViewer image = {image} />
            <View className = "flex flex-row">
               <FontAwesome name = "eye"></FontAwesome>
               <FontAwesome name = "share"></FontAwesome>
               <FontAwesome name = "pencil"></FontAwesome>
               <FontAwesome name = "trash"></FontAwesome>
            </View>

        </View>
    );
}