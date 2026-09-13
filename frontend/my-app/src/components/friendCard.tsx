import { View, Image, Text, Button } from "react-native";
import React from "react";
import { User } from "../types/cards";

type props = {
    item : User
    onPress : () => void;
}

export default function FriendCard({item} : props){
    return(
        <View className = "flex flex-row">
            <Image source = {{uri : item.image}} className = "h-10 aspect-square rounded-full"/>
            <View className="flex flex-col">
                <Text>{item.username}</Text>
                <Text>{item.email}</Text>
                <Button onPress={() => {console.log('pressed')}} title = 'Delete'/>
            </View>
        </View>
    );
}