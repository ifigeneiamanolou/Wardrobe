import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import colors from "../constants/colors";
import Ionicon from 'react-native-vector-icons/Ionicons';
import { Item } from "../types/cards";
import Animated from "react-native-reanimated";
import {useSharedValue, useAnimatedStyle, withSpring} from 'react-native-reanimated';
import {GestureDetector, Gesture} from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";

type props = {
    item : Item;
    dropZoneLayout : {x : number, y : number, width : number, height : number};
    x : number;                  // Absolute horizontal position of image on screen
    y : number;                  // Absolute vertical position of image on screen
    removeItem : (id : string) => void;
    updateTransform : (id : string, x : number, y : number, scale : number, rotate : number) => void;
    // Callback if the image's position, scale or rotation changes
}

const identity3 = () => {
    'worklet';          // Move the function to the UI thread
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}

const multiply = (a : number[], b : number[]) => {
    'worklet';
    return [
        a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
        a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
        a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
        a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
        a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
        a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
        a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
        a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
        a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
    ];
};

const scaleFunction = (sx : number, sy : number) => {
    'worklet';
    return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
}

const translateFunction =  (tx : number, ty : number) => {
    'worklet';
    return [1, 0, 0, 0, 1, 0, tx, ty, 1];
}

const rotateFunction = (rad : number) => {
    'worklet';
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return [c, -s, 0, s, c, 0, 0, 0, 1];
}

const invertMatrix2 = (matrix : number[]) => {
    'worklet';
    const det = matrix[0] * matrix[3] - matrix[1] * matrix[2];
    if(Math.abs(det) < 1e-6){
        return [1, 0, 0, 1];
    };
    return [matrix[3] / det, -matrix[1] / det, -matrix[2] / det, matrix[0] / det];
}

// Map the translation matrix from the image axis to the screen axes
const transformedCoords = (point : {x : number, y : number}, matrix : number[]) => {
    'worklet';
    const m2 = [matrix[0], matrix[1], matrix[3], matrix[4]];
    const inverted = invertMatrix2(m2);
    const newX = inverted[0] * point.x + inverted[2] * point.y;
    const newY = inverted[1] * point.x + inverted[3] * point.y;
    return {x : newX, y : newY};
}

const makeTransformationMatrix = (
    origin : {x : number, y : number},
    translation : {x: number, y : number},
    scale : number,
    rotate : number
) => {
    'worklet';

    // Generate a transformation matrix from rotation, scale and translation
    let m = identity3();
    if(scale !== 1){       // Handle case the pivot of scaling is different than the origin 
        m = multiply(m, translateFunction(origin.x, origin.y));
        m = multiply(m, scaleFunction(scale, scale));
        m = multiply(m, translateFunction(-origin.x, -origin.y));
    }

    if(rotate !== 0){
        m = multiply(m, translateFunction(origin.x, origin.y));
        m = multiply(m, rotateFunction(rotate));
        m = multiply(m, translateFunction(-origin.x, -origin.y));
    }

    if(translation.x !== 0 || translation.y !== 0){
        m = multiply(m, translateFunction(translation.x, translation.y));
    }

    return m;
}

const applyTransformation = (
    origin : {x : number, y : number},
    translation : {x: number, y : number},
    scale : number,
    rotate : number,
    matrix : number[]
) => {
    'worklet';
    const transformatCorrect = transformedCoords( translation, matrix);
    const transform = makeTransformationMatrix(
        origin,
        transformatCorrect,
        scale,
        rotate
    ) ;
    return multiply(matrix, transform);
}

export default function ItemCardZoom({item, x, y, removeItem, updateTransform, dropZoneLayout} : props){
    const imageSize = useSharedValue({height : 0, width : 0});
    const translation = useSharedValue({x : 0, y : 0});
    const origin = useSharedValue({x : 0, y : 0});
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);
    const transform = useSharedValue(identity3());
    const isScaling = useSharedValue(false);
    const isRotating = useSharedValue(false);

    const style = useAnimatedStyle(() => {
        // Call the function that applies the transformation continuously
        const matrix = applyTransformation(
            origin.value,
            translation.value,
            scale.value,
            rotation.value,
            transform.value
        );

        return{
            transform : [
                {translateX : matrix[6]},
                {translateY : matrix[7]},
                {scale : Math.hypot(matrix[0], matrix[1])},
                {rotateZ : `${Math.atan2(matrix[1], matrix[0])}rad`},
            ]
        }
    });

    const RotateGesture = Gesture.Rotation()
        .onStart((e) => {
            if(!isRotating.value && !isScaling.value){
                origin.value.x = -(e.anchorX - imageSize.value.width);
                origin.value.y = -(e.anchorY - imageSize.value.height);
            }
            isRotating.value = true;
        })
        .onChange((e) => {
            rotation.value = e.rotation;
        })
        .onEnd(() => {
            transform.value = applyTransformation(
                origin.value,
                translation.value,
                scale.value,
                rotation.value,
                transform.value
            );
            isRotating.value = false;
            rotation.value = 0;
            scale.value = 1;
            translation.value = {x : 0, y : 0};

            updateTransform(
                item._id,
                x + transform.value[6],
                y + transform.value[7],
                Math.hypot(transform.value[0], transform.value[1]),
                Math.atan2(transform.value[1], transform.value[0])
            );
        })

    const ScaleGesture = Gesture.Pinch()
        .onStart((e) => {
            if(!isRotating.value && !isScaling.value){
                origin.value.x = -(e.focalX - imageSize.value.width);
                origin.value.y = -(e.focalY - imageSize.value.height);
            }
            isScaling.value = true;
        })
        .onChange((e) => {
            scale.value = e.scale;
        })
        .onEnd(() => {
            transform.value = applyTransformation(
                origin.value,
                translation.value,
                scale.value,
                rotation.value,
                transform.value
            );
            isScaling.value = false;
            rotation.value = 0;
            scale.value = 1;
            translation.value = {x : 0, y : 0};

            updateTransform(
                item._id,
                x + transform.value[6],
                y + transform.value[7],
                Math.hypot(transform.value[0], transform.value[1]),
                Math.atan2(transform.value[1], transform.value[0])
            );
        })

    const MoveGesture = Gesture.Pan()
        .averageTouches(true)
        .onChange((e) => {
            translation.value = {
                x : translation.value.x + e.changeX,
                y : translation.value.y + e.changeY
            };
        })
        .onEnd(() => {
            // Expected Absolute position
            const absX = x + transform.value[6] + translation.value.x;
            const absY = y + transform.value[7] + translation.value.x;

            // Check if within bounds
            const bounded = (absX >= dropZoneLayout.x) &&
                (absY >= dropZoneLayout.y) &&
                (absX + imageSize.value.width <= dropZoneLayout.x + dropZoneLayout.width) &&
                (absY + imageSize.value.height <= dropZoneLayout.y + dropZoneLayout.height);

            if(bounded){
                transform.value = applyTransformation(
                    origin.value,
                    translation.value,
                    scale.value,
                    rotation.value,
                    transform.value
                );
                translation.value = {x : 0, y : 0};
            } else {      // Spring back to last position
                translation.value = withSpring({x : 0, y : 0});
            }
            rotation.value = 0;
            scale.value = 1;
            
            updateTransform(
                item._id,
                x + transform.value[6],
                y + transform.value[7],
                Math.hypot(transform.value[0], transform.value[1]),
                Math.atan2(transform.value[1], transform.value[0])
            );
        })

    const TapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            scale.value = 1.25 * scale.value;

            updateTransform(
                item._id,
                x + transform.value[6],
                y + transform.value[7],
                Math.hypot(transform.value[0], transform.value[1]),
                Math.atan2(transform.value[1], transform.value[0])
            );
        })

    const gesture = Gesture.Simultaneous(
        TapGesture,
        MoveGesture,
        RotateGesture,
        ScaleGesture
    )

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
                onLayout={(e) => {
                    imageSize.value = {
                        height : e.nativeEvent.layout.height,
                        width : e.nativeEvent.layout.width
                    }
                }}
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