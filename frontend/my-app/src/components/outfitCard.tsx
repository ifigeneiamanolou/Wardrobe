// Contains the flip card used in the library for outfits

import { Outfit } from "../types/cards";
import React from 'react';
import {View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import FlipCard from "./flipCard";
import OutfitMetadata from "./outfitMetadata";
import { StyleSheet } from "react-native";
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
        <View className = "flex-1 mx-2">
            <FlipCard 
                isFlipped = {flipped}
                flippedContent = {
                    <ImageContainer
                        image = {outfit.image}
                        name = {outfit.name}
                        type = "Outfits"
                        _id = {outfit._id}
                        onFlip = {flip}
                        saved = {false}     // CONDITIONAL !!!!!!!!
                        database = "Outfits"
                    />
                }
                reguralContent = {
                    <OutfitMetadata
                        description= {outfit.description}
                        favorite = {outfit.favorite}
                        _id = {outfit._id}
                        onFlip = {flip}
                        saved = {false}   // CONDITIONAL !!!!!!!!!!
                    /> 
                }
                duration = {500}
                direction = 'y'
                cardStyle = {styles.flipCard}
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