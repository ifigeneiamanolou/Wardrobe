import { Text, View} from 'react-native';
import React from 'react';
import Outfit from '@/src/components/readyOutfit';

const PlaceholderImage1 = require("@/assets/images/Outfit1.jpg");
const PlaceholderImage2 = require("@/assets/images/Outfit3.jpg");
const PlaceholderImage3 = require("@/assets/images/Outfit4.jpg");

export default function Home() {
    return(
        <View className = "grid ">
            <Outfit image = {PlaceholderImage1}></Outfit>
            <Outfit image = {PlaceholderImage2}></Outfit>
            <Outfit image = {PlaceholderImage3}></Outfit>
        </View>
    );
}