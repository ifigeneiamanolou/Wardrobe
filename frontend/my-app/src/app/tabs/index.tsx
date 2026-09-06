import { Text, View, TouchableOpacity, FlatList, TouchableHighlight} from 'react-native';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import constants from '@/src/constants/app';
import { useEffect, useState } from 'react';
import { useSession } from '@/src/ctx';
import { Item, Outfit } from '@/src/types/cards';
import OutfitCard from '@/src/components/outfitCard';
import ItemCard from '@/src/components/itemCard';
import { fetch } from 'expo/fetch';

export default function Home() {
    const valueOutfits = useSharedValue(0);
    const valueItems = useSharedValue(1);
    const [items, setItems] = useState<Item[]>([]);
    const session = useSession();
    const [outfits, setOutfits] = useState<Outfit[]>([]);
    const [showItems, setShowItems] = useState<boolean>(true);
    const [noItems, setNoItems] = useState<boolean>(false);
    const [noOutfits, setNoOutfits] = useState<boolean>(false);

    useEffect(() => {
        if(session?.session){  // Avoid timing issues
            fetchItems();
        }
    }, [session?.session]);

    const onItemChunk = (chunk : string) => {
        const dict = JSON.parse(chunk);
        const item : Item = {
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
            name : dict['name'],
            favorite : dict['favorite'] == "yes" ? true : false
        };
        setOutfits(prev => [...prev, outfit]);
    };

    const fetchItems = async () => {
        if(session?.session === null || session?.session === undefined){
            console.log('Token is null');
            session?.signOut();
            return;
        }
        
        setShowItems(true);
        const resp = await fetch(`${constants['BACKEND_URL']}/load/items`, {
            headers : {
                'Accept' : 'text/event-stream',
                'Authorization' : `Bearer ${session.session}`
            }
        });

        // Handle unauthorized requests
        if(resp.status == 401){
            session.signOut();
            return;
        };

        // Handle no items present in the db
        if(resp.status == 404){
            setNoItems(true);
            return;
        }

        if(!resp.ok){
            throw new Error('Loading failed');
        };

        const reader = resp.body?.getReader();
        let buffer = "";                                // Handle image data
        const decoder = new TextDecoder();              // Decode bytes into JS string
        setItems([]);                     // Clear previous outfits
        setOutfits([]);                   // Clear previous outfits
        setNoItems(false);                // Reset no outfits state
        const processText = ({value, done, } : ReadableStreamReadResult<Uint8Array>) : Promise<void> | void => {
            // Handle the end of data
            if(done){
                console.log('done');
                return;
            }

            const text = decoder.decode(value, {stream : true});
            buffer += text;
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? "";

            for(const line of lines){
                if(line.trim()){
                    onItemChunk(line.trim());
                }
            }
            return reader?.read().then(processText);  // continue reading
        }

        if(reader){
            reader.read().then(processText);
        }
    }

    const fetchOutfits = async () => {
        if(session?.session === null || session?.session === undefined){
            console.log('Token is null');
            session?.signOut();
            return;
        }
        setShowItems(true);

        const resp = await fetch(`${constants['BACKEND_URL']}/load/outfits`, {
            headers : {
                'Accept' : 'text/event-stream',
                'Authorization' : `Bearer ${session.session}`
            }
        });

        // Handle unauthorized requests
        if(resp.status == 401){
            session.signOut();
            return;
        };

        // Handle no outfits present in the db
        if(resp.status == 404){
            setNoOutfits(true);
            return;
        }

        if(!resp.ok){
            throw new Error('Loading failed');
        };

        const reader = resp.body?.getReader();
        let buffer = "";
        const decoder = new TextDecoder();  // Decode bytes into JS string
        setOutfits([]);                     // Clear previous outfits
        setItems([]);                       // Clear previous items
        setNoOutfits(false);                // Reset no outfits state
        const processText = ({value, done} : ReadableStreamReadResult<Uint8Array>) : Promise<void> | void => {
            if(done){
                console.log('done');
                return;
            }

            const text = decoder.decode(value, {stream : true});
            buffer += text;
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? "";

            for(const line of lines){
                if(line.trim()){
                    console.log(line.trim())
                    onOutfitChunk(line.trim());
                }
            }
            
            return reader?.read().then(processText);  // continue reading
        }

        if(reader){
            reader.read().then(processText);
        }
    }

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
        await fetchOutfits();
    };

    const onSelectItems = async() => {
        if(valueItems.value == 0){
            valueItems.value = withTiming(1, {duration : 700, easing : Easing.in(Easing.cubic)});
            valueOutfits.value = withTiming(0, {duration : 700, easing : Easing.in(Easing.cubic)});
        };
        await fetchItems();
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
                    <Text className = "text-dusty-rose font-bold text-xl justify-center items-center">
                        No items found
                    </Text> :
                    <FlatList
                        ItemSeparatorComponent={<View/>}
                        data = {items}
                        numColumns = {2}
                        horizontal = {false}
                        className='flex-1 bg-dusty-rose'
                        renderItem={({item}) => (<ItemCard item = {item}/>)}
                   
                />) :
                (noOutfits ? 
                    <Text className = "text-white font-bold text-xl justify-center items-center">
                        No outfits found
                    </Text> :
                    <FlatList
                        ItemSeparatorComponent={<View/>}
                        data = {outfits}
                        horizontal = {false}
                        numColumns = {2}
                        className='flex-1 flex-wrap'
                        renderItem={({item}) => (<OutfitCard outfit = {item}/>)}
                    />
                )}
        </View> 
    );
}