// Renders an image of an outfit or item in a flip card

import React, {useState} from "react";
import { Image, View, Text, TouchableOpacity, TextInput } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import colors from "../constants/colors";
import { deleteItem } from "../apis/edit";
import { submit } from "../apis/edit";
import { useSession } from "../ctx";

type Props = {
    image : string;
    name : string;
    type : string;
    _id : string;
    onFlip : () => void;
    saved : boolean;    // If saved from feed the user can't edit it
}

export default function ImageContainer({image, name, type, _id, onFlip, saved} : Props){
    const [editName, setEditName] = useState<boolean>(false);
    const [nameValue, onChangeName] = useState<string>(name);
    const session = useSession();

    const onEnd = () => {
        setEditName(false);
    }

    const handleSubmit = (_ : string) => {
        const previous = nameValue
        onChangeName('Loading ...');
        return previous;
    }

    const handleChange = (_ : string, value : string) => {
        onChangeName(value);
    }

    return(
        <View className="flex-1 justify-center items-center bg-blush p-4 rounded-2xl">
            <View className = "flex-1 overflow-hidden w-full justify-center items-start gap-2">
                <Image source = {{uri : `data:image/png;base64,${image}`}} className="flex-1 w-full h-full rounded-2xl" />
                <View className = "flex flex-row justify-start items-center">
                    {!editName ?
                        <Text className="text-white flex-grow"> {nameValue} </Text>: 
                        <TextInput 
                            className = "text-white border border-white rounded-lg px-1 mx-3 h-7 flex-grow"
                            value = {nameValue}                            
                            onChangeText = {onChangeName}
                            style = {{paddingVertical : 5}}
                            onSubmitEditing = {() => submit({
                                type : 'name',
                                value : nameValue,
                                onEnd : onEnd,
                                handleChange : handleChange,
                                handleSubmit : handleSubmit,
                                _id : _id,
                                session : session
                            })}
                        />
                    }
                    {!saved ?  
                        <TouchableOpacity onPress={() => setEditName(!editName)}>
                            <Feather 
                                name = "edit" 
                                size = {24} 
                                color = {colors['White']} 
                                className = "flex pr-2" 
                            />
                        </TouchableOpacity> 
                    : null}
                    
                    <TouchableOpacity onPress = {() =>deleteItem({
                        _id : _id,
                        type : type,
                        session : session
                    })}>
                    <Ionicons name = "trash" size = {24} color = {colors['White']} className = "pr-2" />
                    </TouchableOpacity> 
                    <TouchableOpacity onPress = {onFlip}>
                        <Feather name = "refresh-cw" size = {22} color = {colors['White']} className = "pr-2" />
                    </TouchableOpacity> 
                </View>
            </View>
        </View>
    )
}