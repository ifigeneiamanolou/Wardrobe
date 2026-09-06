import { Item } from "../types/cards";
import React from 'react';
import { TouchableHighlight } from "react-native";
import FlipCard from "./flipCard";
import ImageMetadata from "./itemMetadata";
import ImageContainer from "./imageContainer";
import { useSharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native";

type props = {
    item : Item
}

export default function ItemCard({item} : props){
    const isFlipped = useSharedValue(false);
    return(
        <TouchableHighlight 
            key = {item.name}
            onPress={() => {
                isFlipped.value = !isFlipped.value;
            }}
            className="flex-1 aspect-square bg-graphite"
        >
            <FlipCard 
                isFlipped = {isFlipped}
                flippedContent = {
                    <ImageContainer
                        image = {item.image}
                        name = {item.name}
                    />
                }
                cardStyle = {styles.flipCard}
                reguralContent = {
                    <ImageMetadata
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
        </TouchableHighlight>
    );      
}

const styles = StyleSheet.create({
    flipCard: {
        width : 170,
        height : 140,
        backfaceVisibility : 'hidden',
    }
})