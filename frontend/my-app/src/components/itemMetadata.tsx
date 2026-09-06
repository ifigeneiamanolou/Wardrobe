import React, {useState} from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";

type Props = {
    shop : string;
    favorite : boolean;
    size : string;
    price : string;
    category : string;
    color : string;
}

export default function ItemMetadata({shop, favorite, size, price, category, color} : Props){
    const [isFavorite, setIsFavorite] = useState(favorite);

    const changeFavorite = () => {
        setIsFavorite(!isFavorite);
    }

    return(
        <View className="flex-1 bg-blush p-4 rounded-2xl">
            <View className = "flex-1 overflow-hidden w-full items-start gap-2">

                <View className="flex flex-row">
                    <Text className="font-bold text-white text-lg">Shop: </Text>
                    <Text className="text-white flex-grow"> {shop} </Text>
                    <TouchableOpacity onPress={changeFavorite}>
                        <Ionicon 
                            name = {isFavorite ? "heart" : "heart-outline"} 
                            color = {isFavorite ? `${colors['Dusty rose']}` : `${colors['White']}`} 
                            size = {24} 
                            className = "flex"
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex flex-row">
                    <Text className="font-bold text-white">Size: </Text>
                    <Text className="text-white"> {size} </Text>
                </View>

                <View className="flex flex-row"> 
                    <Text className="font-bold text-white">Price: </Text>
                    <Text className="text-white"> {price} </Text>
                </View>

                <View className="flex flex-row">
                    <Text className="font-bold text-white">Category: </Text>
                    <Text className="text-white"> {category} </Text>
                </View>

                <View className="flex flex-row">
                    <Text className="font-bold text-white ">Color: </Text>
                    <Text className="text-white"> {color} </Text>
                </View>
            </View>
        </View>
    );
}