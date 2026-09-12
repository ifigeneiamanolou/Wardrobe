import { View, Image, Text, Button } from "react-native";
import React from "react";
import colors from "../constants/colors";
import { User } from "../types/cards";
import Ionicon from 'react-native-vector-icons/Ionicons';

type props = {
    item : User
}

export default function UserCard({item} : props){
    return(
        <View className = "flex flex-row">
            {item.image == "" ? 
                <Ionicon name = "person-circle" size = {150} color = {colors['Blush']} />
                : <Image source = {{uri : item.image}} className = "h-10 aspect-square rounded-full"/>
            }
            <View className="flex flex-col">
                <Text>{item.username}</Text>
                <Text>{item.email}</Text>
                <Button onPress={() => {console.log('pressed')}} title = 'Add'/>
            </View>
        </View>
    );
}