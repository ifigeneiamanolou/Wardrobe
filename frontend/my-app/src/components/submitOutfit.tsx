import React, { useEffect, useRef, useState } from "react";
import { View, Image, TouchableOpacity, TextInput, Text } from "react-native";
import { Item } from "../types/cards";
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "../constants/colors";
import * as ImagePicker from 'expo-image-picker';
import {captureRef} from 'react-native-view-shot';
import showAlert from "./alert";
import { Paths, File } from "expo-file-system";
import * as yup from 'yup';
import { useFormik } from "formik";
import { saveOutfit } from "../apis/save";
import { useSession } from "../context/ctx";
import AnimatedBag from "./bouncingAnimation";

const IMAGE_INITIAL_SIZE = 60;

type props = {
    images : {item : Item, translationX : number, translationY : number, scale : number}[];
    dropZoneLayout : {x : number, y : number, height : number, width : number};
    onBack : () => void;
}

const schema = yup.object().shape({
    title : yup.string()
        .required('Please enter a title for the image')
        .min(2, 'Title is too small')
        .max(50, 'Title is too large'),
    description : yup.string()
        .required('Please enter a description for the image')
        .min(2, 'Description is too small')
        .max(200, 'Description is too large'),
    favorite : yup.boolean(),
});

export default function SubmitOutfit({images, dropZoneLayout, onBack} : props){
    const [permission, requestPermission] = ImagePicker.useMediaLibraryPermissions();
    const ImageView = useRef<View>(null);
    const [image, setImage] = useState<string>('');
    const [boxLayout, setBoxLayout] = useState({
        x : 0, y : 0, height : 0, width : 0
    });         // Used to position the like button
    const [widthIcon, setWidthIcon] = useState<number>(0);
    const session = useSession();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [outerLayout, setOuterLayout] = useState({
        x : 0, y : 0, height : 0, width : 0
    });         // Used to render the animation

    const formik = useFormik({
        validationSchema : schema,
        initialValues : {
            title : "",
            description : "",
            favorite : false,
        },
        onSubmit : async(values, {resetForm}) => {
            setIsLoading(true);
            await saveOutfit({
                uri : image,
                items : images.map((v) => v.item),
                title : values.title,
                description : values.description,
                favorite : values.favorite,
                session : session,
                onEnd : () => {
                    resetForm();
                    onBack();
                    setIsLoading(false);
                }
            })
        }
    })

    useEffect(() => {
        if(!permission?.granted){
            requestPermission();
        }
    }, []);

    const submit = async () => {
        // Take a screenshot
        let localUri = "";
        try{
            localUri = await captureRef(ImageView, {
                quality : 1,
                height : dropZoneLayout.height * 0.9,
                width : dropZoneLayout.width * 0.9
            });
        }catch(err){
            console.log('Error', err);
            showAlert('Error', 'Unable to take screenshot');
            return;
        }
        
        // Save the screenshot in cache
        const source = new File(localUri);
        const dest = new File(Paths.cache, `outfit_${Date.now()}.jpg`);
        await source.copy(dest);
        setImage(dest.uri);

        // Send the screenshot to the backend
        formik.handleSubmit();
    }

    return(
        <>{isLoading ? (
            <View style = {{
                height : outerLayout.height,
                width : outerLayout.width,
                transform : [
                    {translateX : outerLayout.x},
                    {translateY : outerLayout.y}
                ]
            }}>
                <AnimatedBag />
            </View>
        ) : (
            <View 
                className="flex flex-col w-full justify-center items-center gap-4" 
                onLayout={(event) => {
                    setBoxLayout(event.nativeEvent.layout);
                }}
            >
                {/* Popup title */}
                <Text className="text-dusty-rose font-bold text-2xl"> Save outfit </Text>
                <View 
                    style = {{
                        height : dropZoneLayout.height * 0.85,
                        width : dropZoneLayout.width * 0.85,
                        position : 'relative'
                    }}
                    className="bg-white rounded-lg overflow-hidden"
                    ref = {ImageView}
                    collapsable = {false}
                    onLayout={(event) => {
                        setBoxLayout(event.nativeEvent.layout);
                    }}
                >
                    {/* Images */}
                    {images.map((value, index) => (
                        <Image 
                            key = {index}
                            source = {{uri : `data:image/png;base64,${value.item.image}`}} 
                            style={{ 
                                width: IMAGE_INITIAL_SIZE * value.scale , 
                                height: IMAGE_INITIAL_SIZE * value.scale, 
                                transform : [
                                    {translateX : value.translationX},
                                    {translateY : value.translationY}
                                ]
                            }} 
                            resizeMode="cover"
                        />
                    ))}
                </View>

                {/* Like button */}
                <TouchableOpacity 
                    className="absolute p-2"
                    style = {{top : boxLayout.y, left : boxLayout.x + boxLayout.width - widthIcon}}
                    onLayout={(event) => {
                        setWidthIcon(event.nativeEvent.layout.width)
                    }}
                    onPress = {() => {
                        formik.setFieldValue('favorite', !formik.values.favorite)
                    }}
                >
                    <Ionicon 
                        name = {formik.values.favorite ? "heart" : "heart-outline"}
                        size = {36} 
                        color = {colors['Dusty rose']}
                    />
                </TouchableOpacity>

                {/* Form fields */}
                <View className = "flex flex-row bg-white/50 items-center border-2 border-dusty-rose border-dashed rounded-lg px-3 h-12">
                    <TextInput 
                        placeholder='Title' 
                        value={formik.values.title} 
                        onChangeText={formik.handleChange('title')}
                        onBlur={formik.handleBlur('title')}
                        autoCapitalize='none'
                        className = "flex-grow text-dusty-rose ml-2"
                    />
                </View>
                {formik.errors.title && formik.touched.title && 
                    <Text className='font-bold text-error mt-1 text-xs'>{formik.errors.title}</Text>
                }

                <View className = "flex flex-row bg-white/50 items-center border-2 border-dusty-rose border-dashed rounded-lg px-3 h-12">
                    <TextInput 
                        placeholder='Description' 
                        value={String(formik.values.description)} 
                        onChangeText={formik.handleChange('description')}
                        onBlur={formik.handleBlur('description')}
                        autoCapitalize='none'
                        className = "flex-grow text-dusty-rose ml-2"
                    />
                </View>
                {formik.errors.description && formik.touched.description && 
                    <Text className='font-bold text-error mt-1 text-xs'>{formik.errors.description}</Text>
                }

                {/* Buttons */}
                <View className="flex flex-row gap-10">
                    <TouchableOpacity 
                        className="bg-rose rounded-lg p-2"
                        onPress={onBack}
                    >
                        <Text className="font-bold text-white text-xl">Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={submit}
                        className="bg-rose rounded-lg p-2"
                    >
                        <Text className="font-bold text-white text-xl">Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}</>
    )
}