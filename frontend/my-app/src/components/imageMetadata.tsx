import React from "react";
import { View, Text } from "react-native";
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";

type Props = {
    shop : string;
    favorite : boolean;
    size : string;
    price : string;
    category : string;
    color : string;
}

export default function ImageMetadata({shop, favorite, size, price, category, color} : Props){
    return(
        <View className = "flex-1 flex-col">
            <Ionicon 
                name = {favorite ? "heart" : "heart-outline"} 
                color = {favorite ? `${colors['Dusty rose']}` : `${colors['Graphite']}`} 
                size = {24} 
                className = "flex justify-end"
            />

            <View className="flex flex-row">
                <Text className="font-bold text-white">Shop: </Text>
                <Text className="text-white"> {shop} </Text>
            </View>

            <View className="flex flex-row">
                <Text className="font-bold text-white">Size: </Text>
                <Text className="text-white"> {size} </Text>
            </View>

            <View className="flex flex-row"> 
                <Text className="font-bold text-white">Price: </Text>
                <Text className="text-white"> {price} </Text>
            </View>

            <View className="flex flex-row">
                <Text className="font-bold text-white"> Category: </Text>
                <Text className="text-white"> {category} </Text>
            </View>

        </View>
    );
}