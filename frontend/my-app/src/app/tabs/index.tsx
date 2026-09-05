import { Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';

export default function Home() {
    const valueOutfits = useSharedValue(1);
    const valueItems = useSharedValue(0);

    const styleItems = useAnimatedStyle(() => ({
        opacity : valueItems.value,
        transform : [{scale : valueItems.value}]
    }));

    const styleOutfits = useAnimatedStyle(() => ({
        opacity : valueOutfits.value,
        transform : [{scale : valueOutfits.value}]
    }));

    const onSelectOutfits = () => {
        if(valueOutfits.value == 0){
            valueOutfits.value = withTiming(1, {duration : 700, easing : Easing.in(Easing.cubic)});
            valueItems.value = withTiming(0, {duration : 700, easing : Easing.in(Easing.cubic)});
        };
    };

    const onSelectItems = () => {
        if(valueItems.value == 0){
            valueItems.value = withTiming(1, {duration : 700, easing : Easing.in(Easing.cubic)});
            valueOutfits.value = withTiming(0, {duration : 700, easing : Easing.in(Easing.cubic)});
        };
    };

    return(
        <View className = "flex-1 bg-white">
            {/* Menu */}
            <View className = "flex flex-row h-10 justify-around items-center m-2">
                <TouchableOpacity className = "items-center" onPress={onSelectOutfits}>
                    <Text className = "text-dusty-rose font-bold text-xl">
                        Outfits
                    </Text>
                    <Animated.View
                        className = "w-full h-[2px] bg-dusty-rose"
                        style = {styleOutfits}
                    />
                </TouchableOpacity>
                <TouchableOpacity className='items-center' onPress = {onSelectItems}>
                    <Text className = "text-dusty-rose font-bold text-xl">
                        Items
                    </Text>
                    <Animated.View
                        className = "w-full h-[2px] bg-dusty-rose"
                        style = {styleItems}
                    />
                </TouchableOpacity>
            </View>

            {/* Elements */}
        </View>
    );
}