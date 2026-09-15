// Buttons on the right of the feed page

import { View, TouchableOpacity, Text } from "react-native";
import React from "react";
import { ButtonMenu, Menu } from "../types/feed";
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";

function MenuItem({icon, onPress, value} : ButtonMenu){
    return(
        <TouchableOpacity 
            className="flex-1 flex-col p-4 h-10 w-10 items-center justify-center"
            onPress={onPress}
        >
            <Ionicon 
                name = {icon} 
                size  = {24} 
                color = {colors['White']}
            />
            <Text className="font-bold text-base text-white">{value}</Text>
        </TouchableOpacity>
    );
}

export default function FeedIcons({icons} : Menu){
    return(
        <View className="absolute bottom-10 right-0 m-4">
            {icons.map((value, index) => (
                <MenuItem
                    key = {index}
                    icon = {value.icon}
                    onPress = {value.onPress}
                    value = {value.value}
                />
            ))}
        </View>
    );
}