import React, {useState} from "react";
import { View, Text, TouchableOpacity,TextInput } from "react-native";
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";
import { useSession } from "../ctx";
import constants from "../constants/app";
import showAlert from "./alert";
import Feather from 'react-native-vector-icons/Feather';

type Props = {
    shop : string;
    favorite : boolean;
    size : string;
    price : string;
    category : string;
    color : string;
    _id : string;
}

export default function ItemMetadata({shop, favorite, size, price, category, color, _id} : Props){
    const session = useSession();
    const [isFavorite, setIsFavorite] = useState(favorite);
    const [editShop, setEditShop] = useState<boolean>(false);
    const [editSize, setEditSize] = useState<boolean>(false);
    const [editPrice, setEditPrice] = useState<boolean>(false);
    const [editCategory, setEditCategory] = useState<boolean>(false);
    const [editColor, setEditColor] = useState<boolean>(false);
    const [shopValue, onChangeShop] = useState<string>(shop);
    const [priceValue, onChangePrice] = useState<string>(price);
    const [categoryValue, onChangeCategory] = useState<string>(category);
    const [colorValue, onChangeColor] = useState<string>(color);
    const [sizeValue, onChangeSize] = useState<string>(size);

    const handleSubmit = (type : string, value : string) => {
        if(type == "price"){
            onChangePrice('Loading ...');
        } else if(type == "size"){
            onChangeSize('Loading ...');
        } else if(type == "shop"){
            onChangeShop('Loading ...');
        } else if(type == "category"){
            onChangeCategory('Loading ...');
        } else {
            onChangeColor('Loading ...');
        }

        fetch(`${constants['BACKEND_URL']}/edit/value`, {
            method : "POST", 
            headers : {'Authorization' : `Bearer ${session?.session}`},
            body : JSON.stringify({
                '_id' : _id,
                'collection' : 'Items',
                'value' : value,
                'type' : type
            })
        }).then((async (res) => {
            if(res.status == 401){
                session?.signOut();
                return;
            }

            if(!res.ok){
                showAlert('Error', 'Error when changing favorite status');
                return;
            } 

            if(type == "price"){
                onChangePrice(value);
            } else if(type == "size"){
                onChangeSize(value);
            } else if(type == "shop"){
                onChangeShop(value);
            } else if(type == "category"){
                onChangeCategory(value);
            } else {
                onChangeColor(value);
            }
        }))
        .catch((err) => {
            console.log("Log in error", err);
            showAlert('Error', err.message);
        })
        .finally(() => {
            setEditPrice(false);
            setEditCategory(false);
            setEditColor(false);
            setEditShop(false);
            setEditSize(false);
        })
    };

    const changeFavorite = () => {
        setIsFavorite(!isFavorite);
        fetch(`${constants['BACKEND_URL']}/edit/favorite`, {
            method : "POST",
            headers : {'Authorization' : `Bearer ${session?.session}`},
            body : JSON.stringify({
                '_id' : _id,
                'favorite' : isFavorite,
                'collection' : 'Items',
            })
        })
        .then((async (res) => {
            if(res.status == 401){
                session?.signOut();
                return;
            }

            if(!res.ok){
                showAlert('Error', 'Error when changing favorite status');
            }
        }))
        .catch((err) => {
            console.log("Log in error", err);
            showAlert('Error', err.message);
        })
    };

    return(
        <View className="flex-1 bg-blush p-4 rounded-2xl">
            <View className = "flex-1 overflow-hidden w-full items-start gap-2">
                <View className="flex flex-row">
                    <View className="flex flex-grow"/>
                    <TouchableOpacity onPress={changeFavorite}>
                        <Ionicon 
                            name = {isFavorite ? "heart" : "heart-outline"} 
                            color = {isFavorite ? `${colors['Dusty rose']}` : `${colors['White']}`} 
                            size = {24} 
                            className = "flex"
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex flex-row items-center">
                    <Text className="font-bold text-white text-lg">Shop: </Text>
                    {editShop ?
                        <Text className="text-white flex-grow"> {shopValue} </Text>: 
                        <TextInput 
                            className = "text-graphite border border-border rounded-lg px-3 h-12"
                            value = {shopValue}
                            onChangeText = {onChangeShop}
                            onSubmitEditing = {() => handleSubmit('shop', shopValue)}
                        />
                    }
                    <TouchableOpacity onPress={() => {setEditShop(!editShop)}}>
                        <Feather 
                            name = "edit" 
                            size = {24} 
                            color = {colors['White']} 
                            className = "flex" 
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex flex-row items-center">
                    <Text className="font-bold text-white">Size: </Text>
                    {editSize ?
                        <Text className="text-white flex-grow"> {sizeValue} </Text>: 
                        <TextInput 
                            className = "text-graphite border border-border rounded-lg px-3 h-12"
                            value = {sizeValue}
                            onChangeText = {onChangeSize}
                            onSubmitEditing = {() => handleSubmit('size', size)}
                        />
                    }
                    <TouchableOpacity onPress = {() => {setEditSize(!editSize)}}>
                        <Feather 
                            name = "edit" 
                            size = {24} 
                            color = {colors['White']} 
                            className = "flex" 
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex flex-row items-center"> 
                    <Text className="font-bold text-white">Price: </Text>
                    {editPrice ?
                        <Text className="text-white flex-grow"> {priceValue} </Text>: 
                        <TextInput 
                            className = "text-graphite border border-border rounded-lg px-3 h-12"
                            value = {priceValue}
                            onChangeText = {onChangePrice}
                            inputMode="numeric"
                            onSubmitEditing = {() => handleSubmit('price', price)}
                        />
                    }
                    <TouchableOpacity onPress = {() => {setEditPrice(!editPrice)}}>
                        <Feather 
                            name = "edit" 
                            size = {24} 
                            color = {colors['White']} 
                            className = "flex" 
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex flex-row items-center">
                    <Text className="font-bold text-white">Category: </Text>
                    {editCategory ?
                        <Text className="text-white flex-grow"> {categoryValue} </Text>: 
                        <TextInput 
                            className = "text-graphite border border-border rounded-lg px-3 h-12"
                            value = {categoryValue}
                            onChangeText = {onChangeCategory}
                            onSubmitEditing = {() => handleSubmit('category', category)}
                        />
                    }
                    <TouchableOpacity onPress={() => setEditCategory(!editCategory)}>
                        <Feather 
                            name = "edit" 
                            size = {24} 
                            color = {colors['White']} 
                            className = "flex" 
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex flex-row items-center">
                    <Text className="font-bold text-white ">Color: </Text>
                    {editColor ?
                        <Text className="text-white flex-grow"> {colorValue} </Text>: 
                        <TextInput 
                            className = "text-graphite border border-border rounded-lg px-3 h-12"
                            value = {colorValue}
                            onChangeText = {onChangeColor}
                            onSubmitEditing = {() => handleSubmit('color', color)}
                        />
                    }
                    <TouchableOpacity onPress = {() => {setEditColor(!editColor)}}>
                        <Feather 
                            name = "edit" 
                            size = {24} 
                            color = {colors['White']} 
                            className = "flex" 
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}