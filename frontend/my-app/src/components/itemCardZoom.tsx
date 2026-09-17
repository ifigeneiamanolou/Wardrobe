import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import colors from "../constants/colors";
import Ionicon from 'react-native-vector-icons/Ionicons';
import { Item } from "../types/cards";
import Animated from "react-native-reanimated";
import {useSharedValue, useAnimatedStyle} from 'react-native-reanimated';
import { Gesture, GestureDetector} from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";

type props = {
    item : Item;
    x : number;
    y : number
    removeItem : (id : string) => void;
    updateTransform : (id : string, scale : number) => void;
}

export default function ItemCardZoom({item, x, y, removeItem, updateTransform} : props){
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const gesturePinch = Gesture.Pinch().onUpdate((e) => {
        scale.value = e.scale;
    }).onEnd((e) => {
        scheduleOnRN(updateTransform, item._id, e.scale);
    });

    const gestureMove = Gesture.Pan()
        .enableTrackpadTwoFingerGesture(
            true)
        .minPointers(1)
        .maxPointers(2)
        .onUpdate((e) => {
            translateX.value = translateX.value + e.translationX;
            translateY.value = translateY.value + e.translationY;
        })

    const gesture = Gesture.Simultaneous(
        gestureMove,
        gesturePinch
    )

    const style = useAnimatedStyle(() => ({
        transform : [
            {translateX : translateX.value},
            {translateY : translateY.value},
            {scale : scale.value},
        ]
    }));

    return(
        <GestureDetector gesture={gesture}>
            <Animated.View 
                key = {item._id}
                className='flex flex-col bg-white rounded-lg p-2'
                style = {[{
                    position : 'absolute',
                    left : x,
                    top : y
                }, style]}
            >
                <View className='flex flex-row'>
                    <View className='flex-grow'/>
                    <TouchableOpacity onPress = {() => {removeItem(item._id)}}>
                        <Ionicon name = "close" size = {20} color = {colors['Dusty rose']}/>
                    </TouchableOpacity>
                </View>
                <Image 
                    source = {{uri : `data:image/png;base64,${item.image}`}} 
                    style={{ width: 60, height: 60, borderRadius: 8 }} 
                    resizeMode="cover"
                />
            </Animated.View>
        </GestureDetector>
    )
}