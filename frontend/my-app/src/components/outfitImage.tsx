import React from "react";
import { Image, } from "expo-image";
import { ImageSourcePropType } from "react-native";

type Props = {
    image : ImageSourcePropType;
};

export default function ImageViewer({image} : Props){
    return(
        <Image source={image} className=""/>
    )
}