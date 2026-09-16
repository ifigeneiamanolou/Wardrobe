// Contains form to add metadata to the clothing item added

import * as yup from 'yup';
import { View, TextInput, TouchableOpacity,Text} from 'react-native';
import {useFormik} from 'formik';
import React, { useState } from 'react';
import ScrollDown from './scrolldown';
import size from '../constants/sizes';
import Checkbox from './CheckBox';
import { useSession } from '../context/ctx';
import { saveItem } from '../apis/save';
import { useItems } from '../context/itemsCtx';
import AnimatedBag from './bouncingAnimation';

const editSchema = yup.object().shape({
    name : yup.string()
        .required('Please enter a name for the image')
        .min(2, 'Name is too small')
        .max(50, 'Name is too large'),
    favorite : yup.boolean(),
    size : yup.string()
        .nullable()
        .oneOf(['M', 'S', 'L', 'XS', 'XL', 'XXL'], 'Please select a size'),
    price : yup.number()
        .min(0, "Price can't be negative"),
    shop : yup.string()
        .min(2, 'Shop name is too small')
        .max(50, 'Shop name is too large')
});

const data = size.map((c) => ({
    "value" : c.value,
    "label" : c.label
}));

type props = {
    onPress : any;
    uri : string;
}

function EditImage({onPress, uri} : props){
    const session = useSession();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const itemContext = useItems();
    
    const formik = useFormik({
        initialValues : {
            name : "",
            favorite : false,
            size : null,
            price : 0,
            shop : "",
        },
        validationSchema : editSchema,
        onSubmit : async (values, {resetForm}) => {
            setIsLoading(true);
            await saveItem({
                favorite : values.favorite,
                name : values.name,
                size : values.size ?? "",
                shop : values.shop,
                session : session,
                onEnd : () => {
                    resetForm();
                    itemContext?.refreshItems();
                    setIsLoading(false);
                },
                onChange : onPress,
                uri : uri,
                price : values.price
            })
        },
    });

    return isLoading ? (
        <AnimatedBag />
    ) : (
        <View className = "w-full justify-center items-center gap-4">
            {/* Page title */}
            <View className = "flex">
                <Text className = "text-graphite font-bold text-2xl"> Image details </Text>
            </View>

            {/* Form */}
            <View className='flex flex-col w-full'>
                <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                    <TextInput 
                        placeholder='Name' 
                        value={formik.values.name} 
                        onChangeText={formik.handleChange('name')}
                        onBlur={formik.handleBlur('name')}
                        autoCapitalize='none'
                        className = "flex-grow text-graphite ml-2"
                    />
                </View>
                {formik.errors.name && formik.touched.name && 
                    <Text className='font-bold text-error mt-1 text-xs'>{formik.errors.name}</Text>
                }
            </View>

            <View className='flex flex-col w-full'>
                <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                    <TextInput 
                        placeholder='Price' 
                        value={String(formik.values.price)} 
                        onChangeText={formik.handleChange('price')}
                        keyboardType= 'number-pad'
                        onBlur={formik.handleBlur('price')}
                        autoCapitalize='none'
                        className = "flex-grow text-graphite ml-2"
                    />
                </View>
                {formik.errors.price && formik.touched.price && 
                    <Text className='font-bold text-error mt-1 text-xs'>{formik.errors.price}</Text>
                }
            </View>

            <View className='flex flex-col w-full'>
                <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                    <TextInput 
                        placeholder='Shop' 
                        value={formik.values.shop} 
                        onChangeText={formik.handleChange('shop')}
                        autoCapitalize='none'
                        onBlur={formik.handleBlur('shop')}
                        className = "flex-grow text-graphite ml-2"
                    />
                </View>
                {formik.errors.shop && formik.touched.shop && 
                    <Text className='font-bold text-error mt-1 text-xs'>{formik.errors.shop}</Text>
                }
            </View>

            {/* Scrolldown */}
            <ScrollDown 
                data = {data} 
                onChange = {
                    (value : string) => {formik.setFieldValue("size", value)} 
                }
                placeholder = "Select size"
            />

            {/* Toggle */}
            <Checkbox 
                label = "Favorite"
                onPress = { () => {
                    formik.setFieldValue(
                        "favorite",
                        !formik.values.favorite
                    )
                }}
                isChecked = {formik.values.favorite}
            />

            {/* Bottom navigation buttons */}
            <View className = "flex flex-row items-center justify-around mx-4 gap-4">
                <View>
                    <TouchableOpacity 
                        className='flex bg-rose rounded-lg items-center justify-center p-4' 
                        onPress = {onPress}> 
                        <Text className='font-bold text-white' > Back </Text>
                    </TouchableOpacity>
                </View>

                <View className='py-4'>
                    <TouchableOpacity 
                        className='flex bg-rose rounded-lg items-center justify-center p-4' 
                        onPress = {() => formik.handleSubmit()}> 
                        <Text className='font-bold text-white' > 
                            {formik.isSubmitting ? 'Uploading ...' : 'Continue' }
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default EditImage;