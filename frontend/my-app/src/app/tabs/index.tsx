import { Text, View, TouchableOpacity, FlatList} from 'react-native';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useSession } from '@/src/ctx';
import { Item, Outfit } from '@/src/types/cards';
import OutfitCard from '@/src/components/outfitCard';
import ItemCard from '@/src/components/itemCard';
import { fetchItems, fetchOutfits } from '@/src/apis/load';

export default function Home() {
    const session = useSession();
    const valueOutfits = useSharedValue(0);
    const valueItems = useSharedValue(1);
    const [items, setItems] = useState<Item[]>([]);
    const [outfits, setOutfits] = useState<Outfit[]>([]);
    const [showItems, setShowItems] = useState<boolean>(true);
    const [noItems, setNoItems] = useState<boolean>(false);
    const [noOutfits, setNoOutfits] = useState<boolean>(false);

    useEffect(() => {
        if(session?.session){  // Avoid timing issues
            fetchItems({
                cleanup : cleanupItems,
                onItemChunk : onItemChunk,
                session : session,
                onEmpty : () => setNoItems(true)
            });
        }
    }, [session?.session]);

    const cleanupOutfits = () => {
        setItems([]);
        setOutfits([]);
        setNoOutfits(false);
    }

    const cleanupItems = () => {
        setItems([]);
        setOutfits([]);
        setNoItems(false);
    }

    const onItemChunk = (chunk : string) => {
        const dict = JSON.parse(chunk);
        const item : Item = {
            _id : dict['_id'],
            shop : dict['shop'],
            favorite : dict['favorite'] == "yes" ? true : false,
            size : dict['size'],
            price : dict['price'],
            category : dict['category'],
            name : dict['name'],
            color : dict['color'],
            image : dict['image'].trim()
        };
        setItems(prev => [...prev, item]);
    }

    const onOutfitChunk = (chunk : string) => {
        const dict = JSON.parse(chunk);
        const outfit : Outfit = {
            image : dict['image'],
            _id : dict['_id'],
            name : dict['name'],
            favorite : dict['favorite'] == "yes" ? true : false
        };
        setOutfits(prev => [...prev, outfit]);
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
        await fetchOutfits({
            onOutfitChunk : onOutfitChunk,
            cleanup : cleanupOutfits,
            session : session,
            onEmpty : () => setNoOutfits(true)
        });
    };

    const onSelectItems = async() => {
        if(valueItems.value == 0){
            valueItems.value = withTiming(1, {duration : 700, easing : Easing.in(Easing.cubic)});
            valueOutfits.value = withTiming(0, {duration : 700, easing : Easing.in(Easing.cubic)});
        };
        setShowItems(true);
        await fetchItems({
            onItemChunk : onItemChunk,
            cleanup : cleanupItems,
            session : session,
            onEmpty : () => setNoItems(true)
        });
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
                (noItems ? 
                    <Text className = "flex-1 text-dusty-rose font-bold text-xl justify-center items-center">
                        No items found
                    </Text> :
                    <FlatList
                        ItemSeparatorComponent={() => <View className = "h-2"/>}
                        data = {items}
                        numColumns = {2}
                        horizontal = {false}
                        className='flex-1 bg-white'
                        renderItem={({item}) => (<ItemCard item = {item}/>)}
                        contentContainerStyle = {{padding : 10}}                        // Padding around the list
                        columnWrapperStyle = {{
                            justifyContent : 'space-between',
                        }}       // Space between the columns
                />) :
                (noOutfits ? 
                    <Text className = "flex text-dusty-rose font-bold text-xl justify-center items-center">
                        No outfits found
                    </Text> :
                    <FlatList
                        ItemSeparatorComponent={<View className = "h-2"/>}              // Space between the rows
                        contentContainerStyle = {{padding : 10}}                        // Padding around the list
                        data = {outfits}
                        horizontal = {false}
                        numColumns = {2}
                        className='flex-1 bg-white'
                        renderItem={({item}) => (<OutfitCard outfit = {item}/>)}
                        columnWrapperStyle = {{
                            justifyContent : 'space-between'
                        }}       // Space between the columns
                    />
                )}
        </View> 
    );
}