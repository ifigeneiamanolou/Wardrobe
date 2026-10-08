// Used to produce a bouncing animation when ressources are loading in the background

import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
  cancelAnimation,
  ReduceMotion,
  Easing
} from "react-native-reanimated";
import { View, Text } from "react-native";
import {useSession} from '../context/ctx';

type props = {
    label : string;
}

export default function AnimatedBag({label} : props){
    // Shared values live on the UI thread, run on 60fps, and don't trigger react rerenders
    const translateY = useSharedValue(0);
    const scaleX = useSharedValue(0.8);
    const scaleY = useSharedValue(1.2);

    // Trigger a repeated animation sequence on mount
    useEffect(() => {
        translateY.value = withRepeat(withSequence(
            withTiming(-200, { duration: 675, easing: Easing.out(Easing.quad) }),
            withTiming(0,    { duration: 675, easing: Easing.in(Easing.quad) }),
            withTiming(0,    { duration: 450 })      // rest on the floor (180 + 270)
        ), -1, false);

        scaleX.value = withRepeat(withSequence(
            withTiming(0.9, { duration: 675 }),
            withTiming(0.9, { duration: 675 }),
            withTiming(1.3, { duration: 180, easing: Easing.out(Easing.quad) }),
            withTiming(1,   { duration: 270, easing: Easing.out(Easing.cubic) })
        ), -1, false);

        scaleY.value = withRepeat(withSequence(
            withTiming(1.1, { duration: 675 }),
            withTiming(1.1, { duration: 675 }),
            withTiming(0.7, { duration: 180, easing: Easing.out(Easing.quad) }),
            withTiming(1,   { duration: 270, easing: Easing.out(Easing.cubic) })
        ), -1, false);

        return () => {
            cancelAnimation(translateY);
            cancelAnimation(scaleX);
            cancelAnimation(scaleY);
        };
    }, []);

    // Create an animation stylesheet for the image
    const stylesheet = useAnimatedStyle(() => ({
        transform : [
            {translateY : translateY.value},
            {scaleX : scaleX.value},
            {scaleY : scaleY.value}
        ]
    }))

    // Stop the animation
    const session = useSession();
    if(!session?.isLoading){
        cancelAnimation(translateY);
        cancelAnimation(scaleX);
        cancelAnimation(scaleY);
    }

    return(
        <View className = "flex-1 flex-col items-center pt-20">
            <Text className="text-graphite font-bold text-3xl text-center text-pretty">{label}</Text>
            <View className="flex-1 justify-end">
                <Animated.Image style = {[stylesheet, {
                    height : 150,
                    width : 180
                }]}
                    source = {require("../../assets/animations/layerCopy.png")}
                />
            </View>
        </View>
    )
}