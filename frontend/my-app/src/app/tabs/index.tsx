import { Text, View, TouchableOpacity, FlatList, TouchableHighlight} from 'react-native';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import constants from '@/src/constants/app';
import { useEffect, useState } from 'react';
import useStreaming from '@/src/hooks/useStreaming';
import FlipCard from '@/src/components/flipCard';
import ImageContainer from '@/src/components/imageContainer';
import ImageMetadata from '@/src/components/imageMetadata';

type Item = {
    shop : string;
    favorite : boolean;
    size : string;
    price : string;
    category : string;
    color : string;
    name : string;
    image : string;
};

export default function Home() {
    const valueOutfits = useSharedValue(0);
    const valueItems = useSharedValue(1);
    const {receiveStreamingMessage} = useStreaming();
    const [items, setItems] = useState<Item[]>([]);
    const [flipped, setFlipped] = useState<boolean>(false);

    useEffect(() => {

    }, [])

    const onChunk = (chunk : string) => {
        const dict = JSON.parse(chunk);
        const item : Item = {
            shop : dict['shop'],
            favorite : dict['favorite'],
            size : dict['size'],
            price : dict['price'],
            category : dict['category'],
            name : dict['name'],
            color : dict['color'],
            image : dict['image']
        };
        setItems(prev => [...prev, item]);
    }

    const fetchItems = async () => {
        await receiveStreamingMessage(
            `${constants['BACKEND_URL']}/load/items`,
            onChunk,
            () => {}
        )
    }

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
        fetchItems();
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
            <FlatList
                ItemSeparatorComponent={<View/>}
                data = {items}
                horizontal = {false}
                numColumns = {2}
                className='flex flex-wrap'
                renderItem={({item}) => (
                    <TouchableHighlight 
                        key = {item.name}
                        onPress={() => setFlipped(!flipped)}
                    >
                        <FlipCard 
                            isFlipped = {flipped}
                            flippedContent = {
                                <ImageContainer
                                    image = {item.image}
                                    name = {item.name}
                                />
                            }
                            reguralContent = {
                                <ImageMetadata
                                    price = {item.price}
                                    shop = {item.shop}
                                    size = {item.size}
                                    color = {item.color}
                                    category = {item.category}
                                    favorite = {item.favorite}
                                />
                            }
                            duration = {500}
                            direction = 'y'
                        />
                    </TouchableHighlight>
                )}
            />
        </View>
    );
}