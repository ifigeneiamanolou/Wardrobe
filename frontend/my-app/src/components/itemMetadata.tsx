import React, {useState} from "react";
import { View, Text, TouchableOpacity,TextInput } from "react-native";
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";
import Feather from 'react-native-vector-icons/Feather';
import { useSession } from "../ctx";
import { submit, changeFavorite } from "../apis/edit";

type Props = {
    shop : string;
    favorite : boolean;
    size : string;
    price : string;
    category : string;
    color : string;
    _id : string;
    onFlip : () => void;
}

export default function ItemMetadata({shop, favorite, size, price, category, color, _id, onFlip} : Props){
    const [isFavorite, setIsFavorite] = useState(favorite);
    const session = useSession();
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

    const onEnd = () => {
        setEditPrice(false);
        setEditCategory(false);
        setEditColor(false);
        setEditShop(false);
        setEditSize(false);
    }

    const handleSubmit = (type : string) : string => {
        let previous = "";
        if(type == "price"){
            previous = priceValue;
            onChangePrice('Loading ...');
        } else if(type == "size"){
            previous = priceValue;
            onChangeSize('Loading ...');
        } else if(type == "shop"){
            previous = priceValue;
            onChangeShop('Loading ...');
        } else if(type == "category"){
            previous = priceValue;
            onChangeCategory('Loading ...');
        } else {
            previous = priceValue;
            onChangeColor('Loading ...');
        }

        return previous;
    }

    const handleChange = (type : string, value : string) => {
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
    }

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        changeFavorite({
            _id : _id,
            isFavorite : isFavorite,
            session : session
        });
    };

    return(
        <View className="flex-1 bg-blush p-4 rounded-2xl">
            <View className = "flex-1 overflow-hidden w-full gap-2">
                <View className="flex flex-row">
                    <Text className="flex flex-grow font-bold text-dusty-rose text-2xl">Details </Text>
                    <TouchableOpacity onPress = {onFlip}>
                        <Feather name = "refresh-cw" size = {22} color = {colors['White']} className = "pr-4" />
                    </TouchableOpacity> 
                    <TouchableOpacity onPress={toggleFavorite}>
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
                    {!editShop ?
                        <Text className="text-white flex-grow"> {shopValue} </Text>: 
                        <TextInput 
                            className = "text-white border border-white rounded-lg mx-3 px-1 h-7 flex-grow"
                            value = {shopValue}
                            style = {{paddingVertical : 5}}
                            onChangeText = {onChangeShop}
                            onSubmitEditing = {() => submit({
                                type : 'shop',
                                value : shopValue,
                                onEnd : onEnd,
                                handleChange : handleChange,
                                handleSubmit : handleSubmit,
                                _id : _id,
                                session : session
                            })}
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
                    {!editSize ?
                        <Text className="text-white flex-grow"> {sizeValue} </Text>: 
                        <TextInput 
                            className = "text-white border border-white rounded-lg px-1 mx-3 h-7 flex-grow"
                            value = {sizeValue}
                            onChangeText = {onChangeSize}
                            style = {{paddingVertical : 5}}
                            onSubmitEditing = {() => submit({
                                type : 'size',
                                value : sizeValue,
                                onEnd : onEnd,
                                handleChange : handleChange,
                                handleSubmit : handleSubmit,
                                _id : _id,
                                session : session
                            })}
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
                    {!editPrice ?
                        <Text className="text-white flex-grow"> {priceValue} </Text>: 
                        <TextInput 
                            className = "text-white border border-white rounded-lg px-1 h-7 mx-3 flex-grow"
                            value = {priceValue}
                            style = {{paddingVertical : 5}}
                            onChangeText = {onChangePrice}
                            inputMode="numeric"
                            onSubmitEditing = {() => submit({
                                type : 'price',
                                value : priceValue,
                                onEnd : onEnd,
                                handleChange : handleChange,
                                handleSubmit : handleSubmit,
                                _id : _id,
                                session : session
                            })}
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
                    {!editCategory ?
                        <Text className="text-white flex-grow"> {categoryValue} </Text>: 
                        <TextInput 
                            className = "text-white border border-white rounded-lg px-1 mx-3 h-7 flex-grow"
                            value = {categoryValue}
                            onChangeText = {onChangeCategory}
                            style = {{paddingVertical : 5}}
                            onSubmitEditing = {() => submit({
                                type : 'category',
                                value : categoryValue,
                                onEnd : onEnd,
                                handleChange : handleChange,
                                handleSubmit : handleSubmit,
                                _id : _id,
                                session : session
                            })}
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
                    {!editColor ?
                        <Text className="text-white flex-grow"> {colorValue} </Text>: 
                        <TextInput 
                            className = "text-white border border-white rounded-lg px-1 h-7 mx-3 flex-grow"
                            value = {colorValue}
                            onChangeText = {onChangeColor}
                            style = {{paddingVertical : 5}}
                            onSubmitEditing = {() => submit({
                                type : 'color',
                                value : colorValue,
                                onEnd : onEnd,
                                handleChange : handleChange,
                                handleSubmit : handleSubmit,
                                _id : _id,
                                session : session
                            })}
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