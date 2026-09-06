import { Outfit } from "../types/cards";
import React from 'react';
import { TouchableHighlight } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import FlipCard from "./flipCard";
import OutfitMetadata from "./outfitMetadata";
import ImageContainer from "./imageContainer";

type props = {
    outfit : Outfit
}

export default function ItemCard({outfit} : props){
    const flipped = useSharedValue<boolean>(false);
    return(
        <TouchableHighlight 
            key = {outfit.image}
            onPress={() => { flipped.value = !flipped.value; }}
        >
            <FlipCard 
                isFlipped = {flipped}
                flippedContent = {
                    <ImageContainer
                        image = {outfit.image}
                        name = {outfit.name}
                        type = "Outfits"
                        _id = {outfit.id}
                    />
                }
                reguralContent = {
                    <OutfitMetadata
                        favorite = {outfit.favorite}
                    />
                }
                duration = {500}
                direction = 'y'
            />
        </TouchableHighlight>
    );      
}