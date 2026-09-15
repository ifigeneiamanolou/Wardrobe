// Contains the flip card used in the library for clothing items

import { Item } from "../types/cards";
import React from 'react';
import { View} from "react-native";
import FlipCard from "./flipCard";
import ItemMetadata from "./itemMetadata";
import ImageContainer from "./imageContainer";
import { useSharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native";

type props = {
    item : Item
}

export default function ItemCard({item} : props){
    const isFlipped = useSharedValue(true);
    const flip = () => {
        isFlipped.value = !isFlipped.value;
    }

    return(
        <View className = "flex-1 mx-2" >
            <FlipCard 
                isFlipped = {isFlipped}
                flippedContent = {
                    <ImageContainer
                        image = {item.image}
                        name = {item.name}
                        type = "Items"
                        _id = {item._id}
                        onFlip = {flip}
                        saved = {false}
                    />
                }
                cardStyle = {styles.flipCard}
                reguralContent = {
                    <ItemMetadata
                        _id = {item._id}
                        price = {item.price}
                        shop = {item.shop}
                        size = {item.size}
                        color = {item.color}
                        category = {item.category}
                        favorite = {item.favorite}
                        onFlip = {flip}
                    />
                }
                duration = {500}
                direction = 'y'
            />
        </View>
    );      
}

const styles = StyleSheet.create({
    flipCard: {
        width : '100%',
        height : 230,
        backfaceVisibility : 'hidden',
    }
})