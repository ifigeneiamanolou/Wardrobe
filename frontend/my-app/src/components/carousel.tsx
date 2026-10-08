import React, {useEffect, useState} from "react";
import { View, Image, FlatList, TouchableOpacity } from "react-native";
import Ionicon from 'react-native-vector-icons/Ionicons';
import LoadingDots from "react-native-loading-dots";
import { Item } from "../types/cards";
import colors from "../constants/colors";

type props = {
    height : number;            // Height of the part of the screen to blur out without the menu and the upper navigation
    width : number;             // Corresponding width
    item_ids : [string];
    onPress : () => void;
}   

type propsImage = {
    item : Item;
}

export default function Carousel({height, width, item_ids, onPress} : props){
    const imageW = width * 0.7;
    const imageH = height * 1.54;
    const [images, setImages] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(true);      // Initially loading when it opens

    // Load the items on component mounting given a list of item ids
    useEffect(() => {
        
    }, []);

    // Avoid rendering the image multiple times between re-renders
    const renderItem = ({item} : propsImage) => (
        <View className="bg-white z-0" style = {{height : imageH, width : imageW}}>
            <Image 
                source = {{uri : item.image}}
                className="rounded-lg z-10"
                style = {{height : imageH, width : imageW}}
            />
        </View>
);

    return(
        <View className="flex-1 w-full">
            {/* Close button */}
            <TouchableOpacity className="absolute top-2 right-2 z-10" onPress={onPress}>
                <Ionicon name = "close" size = {24} color = {colors['Dusty rose']}/>
            </TouchableOpacity>

            <View className="w-full bg-rose items-center justify-center" style = {{width : width}}>
                {loading ? (
                    <LoadingDots
                        dots = {3}
                        colors = {[colors['Blush'], colors['Blush'], colors['Blush']]}
                        size = {10}
                        gap = {2} 
                    />
                ) : (
                    <FlatList
                        data = {images}
                        renderItem={renderItem}
                        keyExtractor = {(item, _) => item._id}
                        showsHorizontalScrollIndicator = {false}
                        horizontal = {true}         // Render items horizontally instead of vertically
                    />
                )}
            </View>
        </View>
    )
}