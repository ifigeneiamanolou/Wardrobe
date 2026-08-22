import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

import { View } from "react-native";

// Shared values live on the UI thread, run on 60fps, and don't trigger react rerenders
const location = useSharedValue(1);  

const animatedBounce = useAnimatedStyle(() => ({

}));

export default function AnimatedBag(){
    // Shared values (animation state)

    // Trigger animation on mount
    useEffect(() => {

    }, []);

    // Stop the animation

    return(
        <View className = "flex-1 justify-center align-middle">
            <Animated.Image 
                source = {{uri : "../../assets/animations/layerCopy.png"}}
            />
        </View>
    )
}