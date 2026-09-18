// Back face of the flip card used in the library outfits for image metadata

import React, {useState} from "react";
import { View, TouchableOpacity, Text, TextInput } from "react-native";
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";
import Feather from 'react-native-vector-icons/Feather';
import { useSession } from "../context/ctx";
import { submit } from "../apis/edit";
import PopUp from "./popUp";

type Props = {
    description : string;
    favorite : boolean;
    onFlip : () => void;
    saved : boolean;
    _id : string;
}

export default function OutfitMetadata({favorite, onFlip, saved, description, _id} : Props){
    const [isFavorite, setIsFavorite] = useState(favorite);
    const session = useSession();
    const [editDescription, setEditDescription] = useState<boolean>(false);
    const [descriptionValue, setDescriptionValue] = useState<string>(description);

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleSubmit = (type : string) => {
        let previous = descriptionValue;
        setDescriptionValue('Loading ...');
        return previous;
    }

    
    return(
        <View className = "flex-1 bg-blush p-4 rounded-2xl">
            <View className = "flex-1 overflow-hidden w-full gap-2">
                <View className="flex flex-row">
                    {/* Title */}
                    <Text className="flex flex-grow font-bold text-dusty-rose text-2xl">Details </Text>

                    {/* Buttons*/}
                    <TouchableOpacity onPress = {onFlip}>
                        <Feather 
                            name = "refresh-cw" 
                            size = {22} 
                            color = {colors['White']} 
                            className = "pr-4" 
                        />
                    </TouchableOpacity> 

                    {/* TO CHANGE */}
                    <TouchableOpacity onPress = {onFlip}>  
                        <Ionicon 
                            name = "eye" 
                            size = {22} 
                            color = {colors['White']} 
                            className = "pr-4" 
                        />
                    </TouchableOpacity> 

                    <TouchableOpacity onPress={toggleFavorite}>
                        <Ionicon 
                            name = {isFavorite ? "heart" : "heart-outline"} 
                            color = {isFavorite ? `${colors['Dusty rose']}` : `${colors['White']}`} 
                            size = {24} 
                            className = "flex"
                        />
                    </TouchableOpacity>
                </View>

                {/* Description field */}
                <View className="flex flex-row items-center">
                    <Text className="font-bold text-white text-lg">Description: </Text>
                    {!editDescription ?
                        <Text className="text-white flex-grow"> {descriptionValue} </Text>: 
                        <TextInput 
                            className = "text-white border border-white rounded-lg mx-3 px-1 h-7 flex-grow"
                            value = {descriptionValue}
                            style = {{paddingVertical : 5}}
                            onChangeText = {setDescriptionValue}
                            onSubmitEditing = {() => submit({
                                type : 'shop',
                                value : descriptionValue,
                                onEnd : () => setEditDescription(false),
                                handleChange : (type : string, value : string) => {
                                    setDescriptionValue(value);
                                },
                                handleSubmit : handleSubmit,
                                _id : _id,
                                session : session,
                                database : "Outfits"
                            })}
                        />
                    }
                    <TouchableOpacity onPress={() => {setEditDescription(!editDescription)}}>
                        <Feather 
                            name = "edit" 
                            size = {24} 
                            color = {colors['White']} 
                            className = "flex" 
                        />
                    </TouchableOpacity>
                </View>

                {/* Pop up */}
            </View>
        </View>
    );
}