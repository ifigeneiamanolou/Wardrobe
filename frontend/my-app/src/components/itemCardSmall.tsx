// Card used to render an item in the new outfit page on the bottom bar
import React , {useState} from "react";
import { Text, Image } from "react-native";
import { Item } from "../types/cards";
import { useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated";
import { PanGesture, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

type props = {
    item : Item;
    dropZoneLayout : any;
}

export default function ItemCardSmall({item, dropZoneLayout} : props){
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const [imageLayout, setImageLayout] = useState({
        height : 0, width : 0
    });

    const panGestureHandler = () => {
        return Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd(() => {
            if(translateX && translateY ){
                if(imageLayout &&
                   translateX.value >= dropZoneLayout.x &&
                   translateY.value <= dropZoneLayout.y && 
                   translateX.value + imageLayout.width <= dropZoneLayout.x + dropZoneLayout.width &&
                   translateY.value + imageLayout.height <= dropZoneLayout.y + dropZoneLayout.height
                ){
                    console.log('success');
                } else{         // Go back to original position if outside
                    translateX.value = withSpring(0);
                    translateY.value = withSpring(0);
                }
            }
        })
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform : [
                {translateX : translateX.value},
                {translateY : translateY.value}
            ]
        }
    });

    return(
        <GestureDetector gesture = {panGestureHandler()}>
            <Animated.View 
                className= "flex-col bg-white rounded-lg items-center p-1 z-10"
                style = {[animatedStyle, {
                    height : 90,
                    width : 80
                }]} 
                onLayout={(event) => {
                    const {height, width} = event.nativeEvent.layout;
                    setImageLayout({height, width});
                }}>
                    <Image 
                        source = {{uri : `data:image/png;base64,${item.image}`}} 
                        style={{ width: 60, height: 60, borderRadius: 8 }} 
                        resizeMode="cover"
                    />
                    <Text className="font-bold text-dusty-rose pt-1">{item.name}</Text>
            </Animated.View>
        </GestureDetector>
    )
}