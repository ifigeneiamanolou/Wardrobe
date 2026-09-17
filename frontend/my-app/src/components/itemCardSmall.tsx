// Card used to render an item in the new outfit page on the bottom bar
import React , {useState} from "react";
import { Text, Image } from "react-native";
import { Item } from "../types/cards";
import { useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import {  Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

type props = {
    item : Item;
    dropZoneLayout : {x : number, y : number, height : number, width : number};
    handleSuccessDrag : (item : Item, x : number, y : number) => void;
}

export default function ItemCardSmall({item, dropZoneLayout, handleSuccessDrag} : props){
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const [imageLayout, setImageLayout] = useState({
        height : 0, width : 0
    });
    const [show, setShow] = useState<boolean>(true);

    const panGestureHandler = () => {
        return Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            if(translateX && translateY ){
                if(imageLayout &&
                   event.absoluteX >= dropZoneLayout.x &&
                   event.absoluteY >= dropZoneLayout.y && 
                   event.absoluteX <= dropZoneLayout.x + dropZoneLayout.width &&
                   event.absoluteY <= dropZoneLayout.y + dropZoneLayout.height
                ){
                    // Run on the JS thread to avoid crashes
                    const relativeX = event.absoluteX - dropZoneLayout.x - 45;
                    const relativeY = event.absoluteY - dropZoneLayout.y - 40;
                    scheduleOnRN(setShow, false);
                    scheduleOnRN(handleSuccessDrag, item,relativeX, relativeY);
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
        <>{show ? (
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
            </GestureDetector>) : null
        }</>
    )
}