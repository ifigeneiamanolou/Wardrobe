import React, {useEffect, useState} from "react";
import { Text, View } from "react-native";
import LoadingDots from "react-native-loading-dots";
import { FlatList } from "react-native";
import { useSession } from "@/src/context/ctx";
import colors from "@/src/constants/colors";
import { Outfit } from "@/src/types/cards";
import OutfitCard from '@/src/components/outfitCard';
import { loadSavedOutfits } from "@/src/apis/load";
import { on } from "node:cluster";

export default function SavedOutfits(){
    const session = useSession();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [outfits, setOutfits] = useState<Outfit[]>([]);
    const [noOutfits, setNoOutfits] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        const loadOutfits = async() => {
            await loadSavedOutfits({
                session : session,
                onLoad : () => {setIsLoading(false)},
                onEmpty : () => setNoOutfits(true),
                onOutfitChunk : onOutfitChunk,
            });
        };
        loadOutfits();
    }, []);

    const onOutfitChunk = (chunk : string) => {
        const dict = JSON.parse(chunk);
        const outfit : Outfit = {
            image : dict['image'],
            _id : dict['_id'],
            name : dict['name'],
            description : dict['description'],
            favorite : dict['favorite'] == "yes" ? true : false,
            item_ids : dict['item_ids']
        };
    
        if(!(dict['_id'] in outfits.map((v) => v._id))){
            setOutfits(prev => [...prev, outfit]);
        } else {
            console.log('Duplicate outfit key: ', dict['_id'])
        }
    };

    return(
        <View className="flex-1 bg-white">
            {noOutfits ? (
                <View className='flex-1 flex-grow p-4 justify-center items-center'>
                    <Text className = " text-dusty-rose font-bold text-xl ">
                        No outfits found
                    </Text> 
                </View>
            ) : isLoading ? (
                <LoadingDots
                    dots = {3}
                    colors = {[colors['Blush'], colors['Blush'], colors['Blush']]}
                    size = {10}
                    gap = {2}
                />
            ) : (
                <FlatList
                    ItemSeparatorComponent={<View className = "h-2"/>}   
                   contentContainerStyle = {{padding : 10}}                        
                    data = {outfits}
                    horizontal = {false}
                    numColumns = {2}
                    className='flex-1 bg-white'
                    renderItem={({item}) => (<OutfitCard outfit = {item} saved = {true}/>)}
                    columnWrapperStyle = {{
                        justifyContent : 'space-between'
                    }}     
                />
            )}
        </View>
    )
}

