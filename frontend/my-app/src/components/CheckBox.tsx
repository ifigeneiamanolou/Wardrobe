// Produces a checkbox that can be used in forms such as the one used to add an item
import React from "react";
import {View, TouchableOpacity, Text} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import colors from "../constants/colors";

type props = {
    label : string;
    isChecked : boolean;
    onPress : any;
};

export default function Checkbox({label, isChecked, onPress} : props){
    const icon = isChecked ? "check-box" : "check-box-outline-blank"
    return (
        <View className = "flex flex-row items-center w-full mx-2">
            <Text className = "flex flex-grow text-graphite"> {label} </Text>
            <TouchableOpacity onPress={onPress}>
                <MaterialIcons name = {icon} size = {24} color = {colors['Graphite']} />
            </TouchableOpacity>
        </View>
    );
}