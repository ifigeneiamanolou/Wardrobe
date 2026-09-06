import { Outfit } from "../types/cards";
import React, { useState } from 'react';
import { TouchableHighlight } from "react-native";
import FlipCard from "./flipCard";
import OutfitMetadata from "./outfitMetadata";
import ImageContainer from "./imageContainer";

type props = {
    outfit : Outfit
}

export default function ItemCard({outfit} : props){
    const [flipped, setFlipped] = useState<boolean>(false);
    return(
        <TouchableHighlight 
            key = {outfit.image}
            onPress={() => setFlipped(!flipped)}
        >
            <FlipCard 
                isFlipped = {flipped}
                flippedContent = {
                    <ImageContainer
                        image = {outfit.image}
                        name = {outfit.name}
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