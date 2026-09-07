import { StyleProp, View, FlexStyle } from "react-native";
import React, {useState} from "react";
import Animated, { interpolate } from "react-native-reanimated";
import { SharedValue, useAnimatedStyle, withTiming, useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

type Props = {
    isFlipped : SharedValue<boolean>;
    direction : string;
    duration : number;
    cardStyle?: StyleProp<FlexStyle>;
    reguralContent : React.ReactNode;   // image
    flippedContent : React.ReactNode;   // metadata
}

export default function FlipCard({
    isFlipped, 
    direction ='y',
    duration = 500,
    cardStyle,
    flippedContent,
    reguralContent
} : Props){
    const [fliped, setFliped] = useState(true);
    const isDirectionX = direction === 'x';         // axis of rotation

    // Change fliped whenever isFlipped changes
    useAnimatedReaction(
        () => {return isFlipped.value},
        (currentValue, previousValue) => {
            if(currentValue !== previousValue){
                scheduleOnRN(setFliped, currentValue);
            }
        }
    )

    const reguralStyle = useAnimatedStyle(() => {
       const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
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
        const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
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
        <View className="flex-1">
            {/* Front */}
            <Animated.View
                style = {[reguralStyle, cardStyle]}   
                className = "absolute z-10"
                pointerEvents={fliped ? 'none' : 'auto'}
            >
                {reguralContent}
            </Animated.View>

            {/* Back */}
            <Animated.View
                style = {[flippedStyle, cardStyle]}
                className = "z-20"
                // Make sure that the backface is able to receive touches since it is behind the front view
                pointerEvents={fliped ? 'auto' : 'none'}  
            >
                {flippedContent}
            </Animated.View>
        </View>
    )
}