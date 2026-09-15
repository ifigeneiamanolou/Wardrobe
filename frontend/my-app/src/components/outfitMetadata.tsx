// Back face of the flip card used in the library outfits for image metadata

import React from "react";
import { View, TouchableOpacity } from "react-native";
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";
import Feather from 'react-native-vector-icons/Feather';

type Props = {
    favorite : boolean;
    onFlip : () => void;
    saved : boolean;
}

export default function OutfitMetadata({favorite, onFlip, saved} : Props){
    return(
        <View className = "flex-1 flex-col">
            <Ionicon 
                name = {favorite ? "heart" : "heart-outline"} 
                color = {favorite ? `${colors['Dusty rose']}` : `${colors['Graphite']}`} 
                size = {24} 
                className = "flex justify-end"
            />
            <TouchableOpacity onPress = {onFlip}>
                <Feather name = "refresh-cw" size = {22} color = {colors['White']} className = "pr-2" />
            </TouchableOpacity> 
        </View>
    );
}