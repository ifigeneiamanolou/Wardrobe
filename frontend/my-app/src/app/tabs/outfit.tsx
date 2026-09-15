import { Text, TouchableOpacity, View, ScrollView} from 'react-native';
import React, {useState} from 'react';

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
    const [selectedType, setSelectedType] = useState<Categories>({type : 'Top'});

    const isSelected = (value : string) : boolean => {
        return value == selectedType.type;
    }

    return(
        <View className='flex-1 bg-white p-2'>
            {/* Main outfit pane */}
            <Text> Outfit page </Text>

            {/* Clothing items library */}
            <View className = "absolute z-10 bottom-2 left-2 right-2 h-48 w-full bg-blush rounded-xl" >
                <View className='flex flex-col p-1'>
                    {/* Menu */}
                    <ScrollView 
                        horizontal = {true}
                        className='h-12 rounded-full bg-white/60 m-1'
                        contentContainerStyle = {{
                            alignItems : 'center',
                            paddingHorizontal : 8
                        }}
                        showsHorizontalScrollIndicator = {false}
                    >
                        {typesList.map((value, index) => (
                            <TouchableOpacity className = "items-center p-2" key = {index} onPress={() => {
                                    setSelectedType({type : value})
                                    console.log('Selected index in menu', index);
                                }}>
                                <Text className = {`font-bold text-xl ${isSelected(value) ? 'text-dusty-rose' : 'text-white'}`}>
                                    {value}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Clothing items */}
                </View>
            </View>
        </View>
    );
}
