import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Pressable} from "react-native";
import { SlideInDown, SlideOutDown} from "react-native-reanimated";
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";
import Animated from "react-native-reanimated";

const DEFAULT_HEIGHT = 200;
type props = {
    show : boolean;     
    onHide : () => void;    
    heightContainer : number;        // Used to render a transparent background      
}

export default function CommentContainer({show, onHide, heightContainer} : props){
    return(
        <>
            {show && <>
            {/*  Transparent background */}
            <Pressable
                style = {{height : heightContainer}}
                className="absolute z-10 w-full bg-graphite opacity-10"
                onPress={onHide}
            />

            {/* Main comment section */}
            <Animated.View 
                className="flex flex-col p-2 bg-blush w-full z-20 rounded-lg" 
                style = {{height : DEFAULT_HEIGHT}}
                entering={SlideInDown}
                exiting={SlideOutDown}
            >
                <View className="flex flex-row">
                    <View className="flex flex-grow"/>
                    <TouchableOpacity onPress={onHide}>
                        <Ionicon size = {24} color = {colors['White']} name = "close"/>
                    </TouchableOpacity>
                </View>

                <Text className="text-white">some text...</Text>
            </Animated.View></>}
        </>
    )
}