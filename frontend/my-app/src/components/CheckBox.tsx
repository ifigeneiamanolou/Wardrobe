import React from "react";
import {View, TouchableOpacity, Text} from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";

type props = {
    label : string;
    isChecked : boolean;
    onPress : any;
};

export default function Checkbox({label, isChecked, onPress} : props){
    const icon = isChecked ? "checkbox-active" : "checkbox-passive"
    return (
        <View className = "flex-1 align-middle justify-center mt-5 mx-5">
            <Text className = "ml-5"> {label} </Text>
            <TouchableOpacity onPress={onPress}>
                <Ionicon name = {icon} size = {24} color = {colors['Graphite']} />
            </TouchableOpacity>
        </View>
    );
}