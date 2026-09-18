import { Text, View, TouchableOpacity, FlatList} from 'react-native';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useSession } from '@/src/context/ctx';
import { Outfit } from '@/src/types/cards';
import OutfitCard from '@/src/components/outfitCard';
import ItemCard from '@/src/components/itemCard';
import { fetchOutfits } from '@/src/apis/load';
import LoadingDots from 'react-native-loading-dots';
import { useItems } from '@/src/context/itemsCtx';
import colors from '@/src/constants/colors';

export default function Home() {
    const session = useSession();
    const itemsContext = useItems();
    const valueOutfits = useSharedValue(0);
    const valueItems = useSharedValue(1);
    const [outfits, setOutfits] = useState<Outfit[]>([]);
    const [showItems, setShowItems] = useState<boolean>(true);
    const [noOutfits, setNoOutfits] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false); // outfits

    useEffect(() => {
        setShowItems(true);
        itemsContext?.refreshItems();
    }, []);

    const cleanupOutfits = () => {
        setOutfits([]);
        setNoOutfits(false);
    }

    const onOutfitChunk = (chunk : string) => {
        const dict = JSON.parse(chunk);
        const outfit : Outfit = {
            image : dict['image'],
            _id : dict['_id'],
            name : dict['name'],
            description : dict['description'],
            favorite : dict['favorite'] == "yes" ? true : false
        };

        if(!(dict['_id'] in outfits.map((v) => v._id))){
            setOutfits(prev => [...prev, outfit]);
        } else {
            console.log('Duplicate outfit key: ', dict['_id'])
        }
    };

    const styleItems = useAnimatedStyle(() => ({
        opacity : valueItems.value,
        transform : [{scale : valueItems.value}]
    }));

    const styleOutfits = useAnimatedStyle(() => ({
        opacity : valueOutfits.value,
        transform : [{scale : valueOutfits.value}]
    }));

    const onSelectOutfits = async() => {
        if(valueOutfits.value == 0){
            valueOutfits.value = withTiming(1, {duration : 700, easing : Easing.in(Easing.cubic)});
            valueItems.value = withTiming(0, {duration : 700, easing : Easing.in(Easing.cubic)});
        };
        setShowItems(false);
        setIsLoading(true);
        await fetchOutfits({
            onOutfitChunk : onOutfitChunk,
            cleanup : cleanupOutfits,
            session : session,
            onEmpty : () => setNoOutfits(true)
        });
        setIsLoading(false);
    };

    const onSelectItems = async() => {
        if(valueItems.value == 0){
            valueItems.value = withTiming(1, {duration : 700, easing : Easing.in(Easing.cubic)});
            valueOutfits.value = withTiming(0, {duration : 700, easing : Easing.in(Easing.cubic)});
        };
        setShowItems(true);
        itemsContext?.refreshItems();
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
            {showItems ?
                (itemsContext?.noItems ? (
                    <View className='flex-1 flex-grow p-4 justify-center items-center'>
                        <Text className = " text-dusty-rose font-bold text-xl ">
                            No items found
                        </Text> 
                    </View>
                ) : itemsContext?.loading ? (
                    <View className='flex-1 h-12 justify-center items-center'>
                        <LoadingDots
                            dots = {3}
                            colors = {[colors['Blush'], colors['Blush'], colors['Blush']]}
                            size = {10}
                            gap = {2}
                        />
                    </View>
                ) : (
                    <FlatList
                        ItemSeparatorComponent={() => <View className = "h-2"/>}
                        data = {itemsContext?.items ?? []}
                        numColumns = {2}
                        horizontal = {false}
                        className='flex-1 bg-white'
                        renderItem={({item}) => (<ItemCard item = {item}/>)}
                        contentContainerStyle = {{padding : 10}}                        
                        columnWrapperStyle = {{
                            justifyContent : 'space-between',
                        }}      
                />)) :
                (noOutfits ? (
                    <View className='flex-1 flex-grow p-4 justify-center items-center'>
                        <Text className = " text-dusty-rose font-bold text-xl ">
                            No outfits found
                        </Text> 
                    </View>
                ) : isLoading ? (
                    <View className='flex-1 h-12 justify-center items-center'>
                        <LoadingDots
                            dots = {3}
                            colors = {[colors['Blush'], colors['Blush'], colors['Blush']]}
                            size = {10}
                            gap = {2}
                        />
                    </View>
                ) : (
                    <FlatList
                        ItemSeparatorComponent={<View className = "h-2"/>}              // Space between the rows
                        contentContainerStyle = {{padding : 10}}                         // Padding around the list}   
                        data = {outfits}
                        horizontal = {false}
                        numColumns = {2}
                        className='flex-1 bg-white'
                        renderItem={({item}) => (<OutfitCard outfit = {item}/>)}
                        columnWrapperStyle = {{
                            justifyContent : 'space-between'
                        }}       // Space between the columns
                    />
                ))}
        </View> 
    );
}