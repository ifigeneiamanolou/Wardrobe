import { View, Image, Text, TouchableOpacity } from "react-native";
import React from "react";
import colors from "../constants/colors";
import { User } from "../types/cards";
import Ionicon from 'react-native-vector-icons/Ionicons';

type props = {
    item : User;
    request : boolean;          // if true the request is sent if false received
    onPress : (username : string) => void;
}

export default function UserCard({item, request} : props){
    const sendNotification = () => {

    };

    const acceptRequest = () => {

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
                {request ?
                <TouchableOpacity
                    className="bg-white justify-center items-center rounded-full p-2 w-36"
                    onPress={sendNotification}     
                >
                    <Text className = "text-blush font-bold font-lg">Add</Text>
                </TouchableOpacity>
                : <TouchableOpacity
                    className="bg-white justify-center items-center rounded-full p-2 w-36"
                    onPress={acceptRequest}     
                >
                    <Text className = "text-blush font-bold font-lg">Accept</Text>
                </TouchableOpacity>}
            </View>
        </View>
    );
}