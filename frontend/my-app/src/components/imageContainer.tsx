import React from "react";
import { Image, View, Text, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";

type Props = {
    image : string;
    name : string;
}

export default function ImageContainer({image, name} : Props){
    const deleteItem = () => {
        //database query
        console.log('bin');
    };

    return(
        <View className="flex-1 justify-center items-center bg-blush p-4 rounded-2xl">
            <View className = "flex-1 overflow-hidden w-full justify-center items-start gap-2">
                <Image source = {{uri : `data:image/png;base64,${image}`}} className="flex-1 w-full h-full rounded-2xl" />
                <View className = "flex flex-row justify-start items-center">
                    <Text className= "flex flex-grow text-lg text-white font-bold">{name}</Text>
                    <TouchableOpacity onPress = {deleteItem}>
                        <Ionicons name = "trash" size = {24} color = {colors['White']} className = "pr-4" />
                    </TouchableOpacity> 
                </View>
            </View>
        </View>
    )
}