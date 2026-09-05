import { Int32 } from "react-native/Libraries/Types/CodegenTypes";
import { View } from "react-native";
import React from "react";
import Animated, { interpolate } from "react-native-reanimated";
import { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

type Props = {
    isFlipped : boolean;
    direction : string;
    duration : number;
    reguralContent : React.ReactNode;   // image
    flippedContent : React.ReactNode;   // metadata
}

export default function FlipCard({
    isFlipped, 
    direction ='y',
    duration = 500,
    flippedContent,
    reguralContent
} : Props){
    const isDirectionX = direction === 'x';         // axis of rotation

    const reguralStyle = useAnimatedStyle(() => {
        const spinValue = interpolate(Number(isFlipped.valueOf()), [0, 1], [0, 180]);
       const rotate = withTiming(`${spinValue}deg`, {duration : duration});
        return {
            transform : [
                isDirectionX ? 
                {rotateX : rotate} :
                {rotateY : rotate}
            ]
        };
    });

    const flippedStyle = useAnimatedStyle(() => {
        const spinValue = interpolate(Number(isFlipped.valueOf()), [0, 1], [180, 360]);
        const rotate = withTiming(`${spinValue}deg`, {duration : duration});
        return {
            transform : [
                isDirectionX ? 
                {rotateX : rotate} :
                {rotateY : rotate}
            ]
        }
    });

    return(
        <View>
            {/* Front */}
            <Animated.View
                style = {reguralStyle}
                className = "absolute z-10"
            >
                {reguralContent}
            </Animated.View>

            {/* Back */}
            <Animated.View
                style = {flippedStyle}
                className = "absolute z-20"
            >
                {flippedContent}
            </Animated.View>
        </View>
    )
}