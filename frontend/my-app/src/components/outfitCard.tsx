import { Outfit } from "../types/cards";
import React from 'react';
import {View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import FlipCard from "./flipCard";
import OutfitMetadata from "./outfitMetadata";
import ImageContainer from "./imageContainer";

type props = {
    outfit : Outfit
}

export default function ItemCard({outfit} : props){
    const flipped = useSharedValue<boolean>(false);
    const flip = () => {
        flipped.value = !flipped.value
    }
    return(
        <View className = "flex-1">
            <FlipCard 
                isFlipped = {flipped}
                flippedContent = {
                    <ImageContainer
                        image = {outfit.image}
                        name = {outfit.name}
                        type = "Outfits"
                        _id = {outfit.id}
                        onFlip = {flip}
                    />
                }
                reguralContent = {
                    <OutfitMetadata
                        favorite = {outfit.favorite}
                        onFlip = {flip}
                    />
                }
                duration = {500}
                direction = 'y'
            />
        </View>
    );      
}