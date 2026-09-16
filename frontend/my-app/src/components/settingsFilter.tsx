import React, {useState} from "react";
import { View, Text ,TouchableOpacity, TextInput} from "react-native";
import { useItems } from "../context/itemsCtx";
import ScrollDown from "./scrolldown";
import Slider from '@react-native-community/slider';
import colors from "../constants/colors";
import Feather from 'react-native-vector-icons/Feather';

type props = {
    onSubmit : (
        shop : string | null,
        upperPrice : number | null,
        size : string | null,
        color : string | null
    ) => void;
    onClear : () => void;
}

export default function SettingsFilter({onSubmit, onClear} : props){
    const itemContext = useItems();
    const [filteredShop, setFilteredShop] = useState<string | null>(null);
    const [filteredColor, setFilteredColor] = useState<string | null>(null);
    const [filteredSize, setFilteredSize] = useState<string | null>(null);
    const [upperFiltered, setUpperFiltered] = useState<number>(1000);
    const [editPrice, setEditPrice] = useState<boolean>(false);

    return(
        <View className = "w-full justify-center items-center gap-4 overflow-hidden">
            {/* Page title */}
            <View className = "flex">
                <Text className = "text-graphite font-bold text-2xl"> Filter </Text>
            </View>

            {/* Color filter */}
            <ScrollDown 
                data = {itemContext?.colors.map((color : string) => ({
                    "value" : color,
                    "label" : color
                })) ?? []} 
                onChange = {
                    (value : string) => {setFilteredColor(value)} 
                }
                placeholder = "Select color"
            />

            {/* Size filter */}
            <ScrollDown 
                data = {itemContext?.sizes.map((size : string) => ({
                    "value" : size,
                    "label" : size
                })) ?? []}  
                onChange = {
                    (value : string) => {setFilteredSize(value)} 
                }
                placeholder = "Select size"
            />

            {/* Shop filter */}
            <ScrollDown 
                data = {itemContext?.shops.map((shop : string) => ({
                    "value" : shop,
                    "label" : shop
                })) ?? []} 
                onChange = {
                    (value : string) => {setFilteredShop(value)} 
                }
                placeholder = "Select shop"
            />

            {/* Price filter */}
            <View className="flex flex-row w-full items-center gap-2" 
                style ={{paddingLeft : 5}}
            >
                <Text className=" text-graphite">Price</Text>
                <Slider
                    minimumValue={0}
                    maximumValue={1000}
                    thumbSize={24}
                    style={{width : '60%',  height: 50 }}
                    value={upperFiltered ?? 1000}
                    minimumTrackTintColor= {colors['Graphite']}
                    maximumTrackTintColor={colors['Graphite']}
                    thumbTintColor= {colors['Dusty rose']}
                    onValueChange={(value) => {
                        setUpperFiltered(value)
                    }}
                />
                {!editPrice ? (
                    <Text className="text-graphite flex-grow">{upperFiltered}</Text>
                ) : (
                    <TextInput 
                        className = "text-graphite border border-border rounded-lg h-8 flex-grow"
                        value = {upperFiltered.toString()}
                        style = {{paddingVertical : 5}}
                        keyboardType="numeric"
                        onChangeText = {(text : string) => setUpperFiltered(Number(text))}
                        onSubmitEditing={() => setEditPrice(false)}
                    />
                )}
                <TouchableOpacity onPress={() => {setEditPrice(!editPrice)}}>
                    <Feather 
                        name = "edit" 
                        size = {24} 
                        color = {colors['Dusty rose']} 
                        className = "flex" 
                    />
                </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View className="flex flex-row items-center justify-around mx-4 gap-4">
                <TouchableOpacity 
                    className="flex bg-rose rounded-lg items-center justify-center p-4"
                    onPress={() => onClear()}
                >
                    <Text className="font-bold text-white text-lg">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className="flex bg-rose rounded-lg items-center justify-center p-4"
                    onPress={() => onSubmit(
                        filteredShop, 
                        upperFiltered, 
                        filteredSize, 
                        filteredColor
                    )}
                >
                    <Text className="font-bold text-white text-lg">Filter</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}