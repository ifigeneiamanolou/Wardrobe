import React from "react";
import { View, Text } from "react-native";
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";

type Props = {
    favorite : boolean;
}

export default function OutfitMetadata({favorite} : Props){
    return(
        <View className = "flex-1 flex-col">
            <Ionicon 
                name = {favorite ? "heart" : "heart-outline"} 
                color = {favorite ? `${colors['Dusty rose']}` : `${colors['Graphite']}`} 
                size = {24} 
                className = "flex justify-end"
            />
        </View>
    );
}