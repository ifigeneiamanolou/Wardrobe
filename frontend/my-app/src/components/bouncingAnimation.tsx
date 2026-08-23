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
import { View, } from "react-native";
import {useSession} from '../ctx';

export default function AnimatedBag(){
    // Shared values live on the UI thread, run on 60fps, and don't trigger react rerenders
    const translateY = useSharedValue(0);
    const scaleX = useSharedValue(0.8);
    const scaleY = useSharedValue(1.2);

    // Trigger a repeated animation sequence on mount
    useEffect(() => {
        // Animate the vertical position of the ball
        translateY.value = withRepeat(
            withSequence(
                withTiming(-200, {
                    duration : 300,
                    easing : Easing.out(Easing.cubic),
                    reduceMotion : ReduceMotion.System
                }),
                withTiming(0, {
                    duration : 300,
                    easing : Easing.in(Easing.cubic),
                    reduceMotion : ReduceMotion.System
                })
            ),
            -1,
            false
        );

        // Animate the horizontal deformation of the ball
        scaleX.value = withRepeat(
            withSequence(
                withTiming(1, {
                    duration : 150,
                    easing : Easing.inOut(Easing.cubic),
                    reduceMotion : ReduceMotion.System
                }),
                withTiming(0.8, {
                    duration : 450,
                    easing : Easing.in(Easing.cubic),
                    reduceMotion : ReduceMotion.System
                }),
                withTiming(1.3, {
                    duration : 150,
                    easing : Easing.out(Easing.cubic),
                    reduceMotion : ReduceMotion.System
                }),
                withTiming(0.8, {
                    duration : 150,
                    easing : Easing.inOut(Easing.cubic),
                    reduceMotion : ReduceMotion.System
                })
            ),
            -1,
            false
        );

        // Animate the vertical deformation of the ball
        scaleY.value = withRepeat(
            withSequence(
                withTiming(1, {
                    duration : 150,
                    easing : Easing.inOut(Easing.cubic),
                    reduceMotion : ReduceMotion.System
                }),
                withTiming(1.2, {
                    duration : 450,
                    easing : Easing.in(Easing.cubic),
                    reduceMotion : ReduceMotion.System
                }),
                withTiming(0.8, {
                    duration : 150,
                    easing : Easing.out(Easing.cubic),
                    reduceMotion : ReduceMotion.System
                }),
                withTiming(1.2, {
                    duration : 150,
                    easing : Easing.inOut(Easing.cubic),
                    reduceMotion : ReduceMotion.System
                })
            ),
            -1,
            false
        );

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
        <View className = "flex-1 justify-center align-middle">
            <Animated.Image style = {stylesheet}
                source = {require("../../assets/animations/layerCopy.png")}
            />
        </View>
    )
}