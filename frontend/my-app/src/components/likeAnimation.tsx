import { StyleProp, View, ViewStyle } from "react-native";
import React, { useEffect } from "react";
import { useAnimatedStyle, withSpring, useSharedValue, withSequence } from "react-native-reanimated";
import Ionicon from 'react-native-vector-icons/Ionicons';
import { scheduleOnRN } from "react-native-worklets";
import colors from "../constants/colors";

type props = {
    onComplete : () => void;
}

export default function LikeAnimation({onComplete} : props){
    const opacity = useSharedValue(0);
    const scale = useSharedValue(1);

    // Show the animation on mount
    useEffect(() => {
        opacity.value = withSequence(
            withSpring(1),
            withSpring(1),
            withSpring(0)
        );

        scale.value = withSequence(
            withSpring(1.2, {damping : 10}),
            withSpring(1, {damping : 10}),
            withSpring(0, {damping : 10}, () => {
                scheduleOnRN(onComplete);       // Run on the JS thread
            })
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity : opacity.value,
        transform : [{scale : scale.value}]
    })) as unknown as StyleProp<ViewStyle>;

    return(
        <View className="absolute top-1/2 left-1/2 z-10" style = {style}>
            <Ionicon name = "heart" size = {48} color = {colors['Dusty rose']}/>
        </View>
    );
}