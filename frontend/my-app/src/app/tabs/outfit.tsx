import { Text, TouchableOpacity, View, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import { useItems } from '@/src/context/itemsCtx';
import ItemCardSmall from '@/src/components/itemCardSmall';
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from '@/src/constants/colors';
import PopUp from '@/src/components/popUp';
import SettingsFilter from '@/src/components/settingsFilter';

const typesList = [
    'Top',
    'Trouser',
    'Pullover',
    'Dress',
    'Coat',
    'Sandal',
    'Shirt',
    'Sneaker',
    'Bag',
    'Ankle boot'
] as const;

interface Categories {
    type : typeof typesList[number];
}

export default function Outfit() {
    const itemContext = useItems();
    const [menuPosition, setMenuPosition] = useState<number>();
    const [width, setWidth] = useState<number>();
    const [openPopUp, setOpenPopUp] = useState<boolean>(false);

    // Filters
    const [selectedType, setSelectedType] = useState<Categories>({type : 'Top'});
    const [selectedShop, setSelectedShop] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [upperPrice, setUpperPrice] = useState<number>(1000);
    
    const onClear = () => {
        setOpenPopUp(false);
        setUpperPrice(1000);                  
    }

    const onSubmit = (
        shop : string | null,
        upperPrice : number | null,
        size : string | null,
        color : string | null
    ) => {
        setOpenPopUp(false);
        setUpperPrice(upperPrice ?? 1000);
        setSelectedColor(color ?? '');
        setSelectedShop(shop ?? '');
        setSelectedSize(size ?? '');
    }

    useEffect(() => {
        if(itemContext?.items.length == 0){
            itemContext.refreshItems();
        }
    }, []);

    const isSelected = (value : string) : boolean => {
        return value == selectedType.type;
    }

    const openSettings = () => {
        setOpenPopUp(true);
    }

    const submit = () => {
        // LOADING STATE WITH ANIMATION
    }

    return(
        <View className='flex-1 bg-white p-2'>
            {/* Main outfit pane */}
            <View
                style = {{
                    height : menuPosition,
                    width : width
                }}
                className='absolute left-2 top-2 right-2 rounded-xl overflow-hidden p-4 bg-blush border-4 border-dashed border-dusty-rose/40 shadow-sm justify-center items-center'
            >
                {/* Container when no items are added */}
                <Ionicon name = "shirt-outline" size = {32} color = {colors['Dusty rose']}/>
                <Text className='font-bold text-dusty-rose mt-2'> Select items to create an outfit </Text>
                
            </View>

            {/* Clothing items library */}
            <View 
                className = "absolute z-10 bottom-2 left-2 right-2 h-48 w-full bg-blush rounded-xl" 
                onLayout={(event) => {
                    setMenuPosition(event.nativeEvent.layout.y - 25);
                    setWidth(event.nativeEvent.layout.width);
                }}
            >
                <View className='flex flex-col p-1'>
                    <View className='flex flex-row gap-2 items-center justify-center'>
                        {/* Menu */}
                        <ScrollView 
                            horizontal = {true}
                            style = {{height : 35}}
                            className=' rounded-full bg-white/60 m-1'
                            contentContainerStyle = {{
                                alignItems : 'center',
                                paddingHorizontal : 8
                            }}
                            showsHorizontalScrollIndicator = {false}
                        >
                            {typesList.map((value, index) => (
                                <TouchableOpacity className = "items-center pr-4" key = {index} onPress={() => {
                                        setSelectedType({type : value})
                                        console.log('Selected index in menu', index);
                                    }}>
                                    <Text className = {`font-bold text-lg ${isSelected(value) ? 'text-dusty-rose' : 'text-white'}`}>
                                        {value}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Filter popup */}
                        <TouchableOpacity 
                            className='flex justify-center items-center rounded-full bg-dusty-rose p-2'
                            onPress={openSettings}
                        >
                            <Ionicon size = {20} color = {colors['White']} name = "settings"/>
                        </TouchableOpacity>

                        {/* Submit button */}
                        <TouchableOpacity 
                            className='flex justify-center items-center rounded-full bg-dusty-rose p-2'
                            onPress={submit}
                        >
                            <Ionicon size = {20} color = {colors['White']} name = "arrow-forward"/>
                        </TouchableOpacity>
                    </View>

                    {/* Clothing items */}
                    <ScrollView 
                        horizontal = {true}
                        style = {{height : 110}}
                        className='rounded-lg bg-white/60 m-1 p-2'
                        showsHorizontalScrollIndicator = {false}
                        contentContainerClassName='gap-2'
                    >
                        {itemContext?.items
                            .filter((value) => (
                                selectedColor == '' || selectedColor == value.color
                            ))
                            .filter((value) => (
                                selectedShop == '' || selectedShop == value.shop
                            ))
                            .filter((value) => (
                                selectedSize == '' || selectedSize == value.size
                            ))
                            .filter((value) => (
                                upperPrice >= Number(value.price)
                            ))
                            .filter((value) => (
                                selectedType.type == value.category
                            ))
                            .map((value, index) => (
                                <ItemCardSmall item = {value} key = {index}/>
                            ))
                        }
                    </ScrollView>

                    {/* Settings pop up */}
                    <PopUp visible = {openPopUp}>
                        <SettingsFilter 
                            onSubmit={onSubmit} 
                            onClear={onClear}>
                        </SettingsFilter>
                    </PopUp>
                </View>
            </View>
        </View>
    );
}
