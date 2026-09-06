import { Item } from "../types/cards";
import React from 'react';
import { Pressable} from "react-native";
import FlipCard from "./flipCard";
import ImageMetadata from "./itemMetadata";
import ImageContainer from "./imageContainer";
import { useSharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native";

type props = {
    item : Item
}

export default function ItemCard({item} : props){
    const isFlipped = useSharedValue(true);
    return(
        <Pressable 
            onPress={() => {
                isFlipped.value = !isFlipped.value;
            }}
            className = "flex-1 active:opacity-80"
        >
            <FlipCard 
                isFlipped = {isFlipped}
                flippedContent = {
                    <ImageContainer
                        image = {item.image}
                        name = {item.name}
                        type = "Items"
                        _id = {item.id}
                    />
                }
                cardStyle = {styles.flipCard}
                reguralContent = {
                    <ImageMetadata
                        _id = {item.id}
                        price = {item.price}
                        shop = {item.shop}
                        size = {item.size}
                        color = {item.color}
                        category = {item.category}
                        favorite = {item.favorite}
                    />
                }
                duration = {500}
                direction = 'y'
            />
        </Pressable>
    );      
}

const styles = StyleSheet.create({
    flipCard: {
        width : '100%',
        height : 200,
        backfaceVisibility : 'hidden',
    }
})