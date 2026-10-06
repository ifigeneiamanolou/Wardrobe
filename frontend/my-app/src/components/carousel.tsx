import React, {useRef, useCallback, useEffect, useState} from "react";
import { View, Image, StyleSheet, FlatList } from "react-native";
import Ionicon from 'react-native-vector-icons/Ionicons';
import LoadingDots from "react-native-loading-dots";
import { Item } from "../types/cards";

type props = {
    height : number;            // Height of the part of the screen to blur out without the menu and the upper navigation
    width : number;             // Corresponding width
}   

type propsImage = {
    item : Item;
}

export default function Carousel({height, width} : props){
    const imageW = width * 0.7;
    const imageH = imageW * 1.54;
    const [images, setImages] = useState<Item[]>([]);

    // Load the items on component mounting given a list of item ids
    useEffect(() => {
        
    }, []);

    // Avoid rendering the image multiple times between re-renders
    const renderItem = ({item } : propsImage) => (
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
            <View className="w-full bg-rose items-center justify-center" style = {{width : width}}>
                <FlatList
                    data = {images}
                    renderItem={renderItem}
                    keyExtractor = {(item, _) => item._id}
                    showsHorizontalScrollIndicator = {false}
                    horizontal = {true}         // Render items horizontally instead of vertically
                />
            </View>
        </View>
    )
}