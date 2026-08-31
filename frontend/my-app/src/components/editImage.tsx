import * as yup from 'yup';
import { View, TextInput, TouchableOpacity,Text} from 'react-native';
import {useFormik} from 'formik';
import React from 'react';
import ScrollDown from './scrolldown';
import size from '../constants/sizes';
import Checkbox from './CheckBox';
import constants from '../constants/app';
import showAlert from './alert';

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

type props = {
    onPress : any;
    showPopUp : boolean;
    uri : string | null;
}

function EditImage({onPress, showPopUp, uri} : props){
    const url = `${constants.BACKEND_URL}\save\item`;
    
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
            const data = {...values, "uri" : uri};
            const requestObj = {
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify(data)
            };
            fetch(url, requestObj)
            .then(async (response) => {
                if(!response.ok){
                    throw new Error('Upload failed');
                }
                showAlert('Success', 'Image was uploaded');
            })
            .catch((err) => {
                console.log("Log in error", err);
                showAlert('Error', err);
            })
            .finally(() => {
                resetForm();
            })
        },
    });

    if(!showPopUp){
        return null;
    };

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
            <View className = "flex-1 flex-row align-middle justify-center mx-4">
                <View className='flex flex-row py-4'>
                    <TouchableOpacity 
                        className='flex-1 bg-rose rounded-lg items-center py-4' 
                        onPress = {onPress}> 
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

export default EditImage;