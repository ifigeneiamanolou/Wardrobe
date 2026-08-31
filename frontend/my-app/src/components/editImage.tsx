import * as yup from 'yup';
import { View, TextInput, TouchableOpacity,Text} from 'react-native';
import {useFormik} from 'formik';
import React, { useState } from 'react';
import ScrollDown from './scrolldown';
import size from '../constants/sizes';
import Checkbox from './CheckBox';

const editSchema = yup.object().shape({
    name : yup.string().required('Please enter a name for the image'),
    favorite : yup.boolean(),
    size : yup.string().oneOf(['M', 'S', 'L', 'XS', 'XL', 'XXL']),
    price : yup.number().min(0, "Price can't be negative"),
    shop : yup.string()
});

const data = size.map((c) => ({
    "value" : c.value,
    "label" : c.label
}));

const editImage = () => {
    const formik = useFormik({
        initialValues : {
            name : "",
            favorite : false,
            size : null,
            price : null,
            shop : null,
        },
        validationSchema : editSchema,
        onSubmit : (values, {resetForm}) => {
            
        },
    });

    return(
        <View>
            {/* Form */}
            <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                <TextInput 
                    placeholder='Name' 
                    defaultValue={formik.values.name} 
                    onChangeText={formik.handleChange('name')}
                    autoCapitalize='none'
                    className = "flex-grow text-graphite ml-2"
                />
            </View>

            <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                <TextInput 
                    placeholder='Price' 
                    defaultValue={formik.values.name} 
                    onChangeText={formik.handleChange('price')}
                    keyboardType= 'number-pad'
                    autoCapitalize='none'
                    className = "flex-grow text-graphite ml-2"
                />
            </View>

            <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                <TextInput 
                    placeholder='Shop' 
                    defaultValue={formik.values.name} 
                    onChangeText={formik.handleChange('shop')}
                    autoCapitalize='none'
                    className = "flex-grow text-graphite ml-2"
                />
            </View>

            {/* Scrolldown */}
            <ScrollDown 
                data = {data} 
                onChange = {
                    (value) => {formik.setFieldValue("size",value)} 
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
            <View className = "flex-1 flex-row align-middle justify-center mx-4">
                <View className='flex flex-row py-4'>
                    <TouchableOpacity 
                        className='flex-1 bg-rose rounded-lg items-center py-4' 
                        onPress = {}> 
                        <Text className='font-bold text-white' > Back </Text>
                    </TouchableOpacity>
                </View>

                <View className='flex flex-row py-4'>
                    <TouchableOpacity 
                        className='flex-1 bg-rose rounded-lg items-center py-4' 
                        onPress = {() => formik.handleSubmit()}> 
                        <Text className='font-bold text-white' > Continue </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );  
};

export default editImage;