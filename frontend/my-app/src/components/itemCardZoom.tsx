import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import colors from "../constants/colors";
import Ionicon from 'react-native-vector-icons/Ionicons';
import { Item } from "../types/cards";

type props = {
    item : Item;
    x : number;
    y : number
    removeItem : (id : string) => void;
}

export default function ItemCardZoom({item, x, y, removeItem} : props){
    return(
        <View 
            key = {item._id}
            className='flex flex-col bg-white rounded-lg p-2'
            style = {{
                position : 'absolute',
                left : x,
                top : y
            }}
        >
            <View className='flex flex-row'>
                <View className='flex-grow'/>
                <TouchableOpacity onPress = {() => {removeItem(item._id)}}>
                    <Ionicon name = "close" size = {20} color = {colors['Dusty rose']}/>
                </TouchableOpacity>
            </View>
            <Image 
                source = {{uri : `data:image/png;base64,${item.image}`}} 
                style={{ width: 60, height: 60, borderRadius: 8 }} 
                resizeMode="cover"
            />
        </View>
    )
}