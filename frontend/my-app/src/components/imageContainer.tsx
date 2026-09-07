import React from "react";
import { Image, View, Text, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import colors from "../constants/colors";
import constants from "../constants/app";
import showAlert from "./alert";
import { useSession } from "../ctx";

type Props = {
    image : string;
    name : string;
    type : string;
    _id : string;
    onFlip : () => void;
}

export default function ImageContainer({image, name, type, _id, onFlip} : Props){
    const session = useSession();

    const deleteItem = () => {
        fetch(`${constants['BACKEND_URL']}/edit/delete`, {
            method : "POST",
            headers : {
                'Authorization' : `Bearer ${session?.session}`,
                'Content-Type': 'application/json'
            },
            body : JSON.stringify({
                'id' : _id,
                'collection' : type,
            })
        })
        .then((async (res) => {
            if(res.status == 401){
                session?.signOut();
                return;
            }

            if(!res.ok){
                showAlert('Error', 'Error when changing favorite status');
            }
        }))
        .catch((err) => {
            console.log("Log in error", err);
            showAlert('Error', err.message);
        })
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
                    <TouchableOpacity onPress = {onFlip}>
                        <Feather name = "refresh-cw" size = {22} color = {colors['White']} className = "pr-2" />
                    </TouchableOpacity> 
                </View>
            </View>
        </View>
    )
}