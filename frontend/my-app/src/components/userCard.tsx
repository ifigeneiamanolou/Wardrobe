import { View, Image, Text, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import colors from "../constants/colors";
import { User } from "../types/cards";
import Ionicon from 'react-native-vector-icons/Ionicons';

type props = {
    item : User
}

export default function UserCard({item} : props){
    const sendNotification = () => {

    };

    return(
        <View className = "flex-1 flex-row items-center justify-start bg-blush rounded-lg gap-8 p-4">
            {item.image == "" ? 
                <Ionicon name = "person-circle" size = {150} color = {colors['White']} />
                : <Image source = {{uri : `data:image/png;base64,${item.image}`}} 
                        className = "rounded-full" style = {{width : 150, height : 150}}
                />
            }
            <View className="flex flex-col gap-3">
                <Text className="font-bold text-white text-2xl">{item.username}</Text>
                <Text className = "text-white text-md">{item.email}</Text>
                <TouchableOpacity
                    className="bg-white justify-center items-center rounded-full p-2 w-36"
                    onPress={sendNotification}     
                >
                    <Text className = "text-blush font-bold font-lg">Add</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}