import { Text, TouchableOpacity, View, ScrollView} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import { useItems } from '@/src/context/itemsCtx';
import ItemCardSmall from '@/src/components/itemCardSmall';
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from '@/src/constants/colors';
import PopUp from '@/src/components/popUp';
import SettingsFilter from '@/src/components/settingsFilter';
import {GestureHandlerRootView } from 'react-native-gesture-handler';
import { Item } from '@/src/types/cards';
import ItemCardZoom from '@/src/components/itemCardZoom';
import showAlert from '@/src/components/alert';
import SubmitOutfit from '@/src/components/submitOutfit';

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
    const [dragLayout, setDragLayout] = useState({
        x : 0, y : 0, height : 0, width : 0
    });

    // Popups
    const [openPopUp, setOpenPopUp] = useState<boolean>(false);
    const [openSubmit, setOpenSubmit] = useState<boolean>(false);

    // Filters
    const [selectedType, setSelectedType] = useState<Categories>({type : 'Top'});
    const [selectedShop, setSelectedShop] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [upperPrice, setUpperPrice] = useState<number>(1000);

    // Drag and drop
    const [droppedImages, setDroppedImages] = useState<{
        item : Item, x : number, y : number, scale : number, rotate : number}[]>([]);
    const [dropZoneLayout, setDropZoneLayout] = useState({
        x : 0, y : 0, height : 0, width : 0
    });
    const dropZoneRef = useRef<View>(null);

    // Back button for the filters
    const onClear = () => {
        setOpenPopUp(false);
        setUpperPrice(1000);                  
    }

    // Submit button for the filters
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

    // Open the popup containing the filters
    const openSettings = () => {
        setOpenPopUp(true);
    }

    // Submit the picture to the db
    const submit = async () => {
        if (droppedImages.length < 2){
            showAlert('Error', 'At least 2 items are needed');
            return;
        }
        
        setOpenSubmit(true);
    }

    const closeSubmit = () => {
        // Close the pop up
        setOpenSubmit(false);

        // Reset the dropped images
        setDroppedImages([]);       
    }

    // Callback when an item is successfully added to the drop pane
    const handleSuccessDrag = (item : Item, x : number, y : number) => {
        setDroppedImages(prev => [...prev, {item, x, y, scale : 1, rotate : 0}]);
    }

    const updateTransform = (id : string, scale : number, x : number, y : number, rotate : number) => {
        setDroppedImages(prev => prev.map(d => 
            d.item._id === id ? {...d, scale, rotate, x, y} : d
        ))
    }

    const removeItem = (id : string) => {
        setDroppedImages(droppedImages.filter(((value) => value.item._id !== id)))
    }

    return(
        <GestureHandlerRootView>
            <View className='flex-1 bg-white p-2'>
                {/* Main outfit pane */}
                <View
                    ref = {dropZoneRef}
                    style = {{
                        height : dragLayout.y - 25,
                        width : dragLayout.width
                    }}
                    className='absolute left-2 top-2 right-2 rounded-xl overflow-hidden p-4 bg-blush border-4 border-dashed border-dusty-rose/40 shadow-sm justify-center items-center'
                    onLayout = {() => {
                        dropZoneRef.current?.measureInWindow((x, y, width, height) => {
                            setDropZoneLayout({x, y, height, width})
                        })
                    }}
                >
                    {droppedImages.length == 0 ? (
                        <><Ionicon name = "shirt-outline" size = {32} color = {colors['Dusty rose']}/>
                        <Text className='font-bold text-dusty-rose mt-2'> Drag items to create an outfit </Text></>
                    ) : (
                        droppedImages.map((value) => (
                            <ItemCardZoom
                                item = {value.item}
                                x = {value.x}
                                y = {value.y}
                                removeItem={removeItem}
                                key = {value.item._id}
                                updateTransform = {updateTransform}
                                dropZoneLayout={dropZoneLayout}
                            />
                        ))
                    )}
                   
                </View>

                {/* Clothing items library */}
                <View 
                    className = "absolute z-10 bottom-2 left-2 right-2 h-48 w-full bg-blush rounded-xl" 
                    onLayout={(event) => {
                        const {x, y, width, height} = event.nativeEvent.layout;
                        setDragLayout({x, y, height, width});
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
                                    <TouchableOpacity 
                                        className = "items-center pr-4" 
                                        key = {index} 
                                        onPress={() => {setSelectedType({type : value})}}>
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
                            style = {{height : 110, overflow : 'visible'}}
                            className='rounded-lg bg-white/60 m-1 p-2'
                            showsHorizontalScrollIndicator = {false}
                            contentContainerClassName='gap-2'
                            contentContainerStyle={{ overflow: 'visible' }}
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
                                .filter((value) => (
                                    !droppedImages.some((dropped) => dropped.item._id === value._id)
                                ))
                                .map((value) => (
                                    <ItemCardSmall 
                                        dropZoneLayout={dropZoneLayout} 
                                        item={value}
                                        key = {value._id}
                                        handleSuccessDrag={handleSuccessDrag} 
                                    />)
                                )
                            }
                        </ScrollView>

                        {/* Settings pop up */}
                        <PopUp visible = {openPopUp} background={colors['White']}>
                            <SettingsFilter 
                                onSubmit={onSubmit} 
                                onClear={onClear}
                            />
                        </PopUp>

                        {/* Submit popup */}
                        <PopUp visible = {openSubmit} background={colors['Blush']}>
                            <SubmitOutfit
                                images = {droppedImages.map((value) => ({
                                    item : value.item,
                                    translationX : value.x - dropZoneLayout.x,
                                    translationY : value.y - dropZoneLayout.y,
                                    scale : value.scale,
                                    rotate : value.rotate
                                }))}
                                dropZoneLayout={dropZoneLayout}
                                onBack={closeSubmit}
                            />
                        </PopUp>
                    </View>
                </View>
            </View>
        </GestureHandlerRootView>
    );
}
