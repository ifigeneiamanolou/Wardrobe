import React, { useState } from 'react';
import * as yup from 'yup';
import {useFormik} from 'formik';
import '../../global.css';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { View, Text, TextInput, TouchableOpacity} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import { signup } from '../apis/auth';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import showAlert from "../components/alert";

const SignUpSchema = yup.object().shape({
    name : yup.string().
        required('Name is required')
        .min(2, 'Too short!')
        .max(50, 'Too long'),
    username : yup.string()
        .required('Username is required')
        .min(2, 'Too short')
        .max(50, 'Too long'),
    email : yup.string()
        .email('Email is invalid') 
        .required('Email is required'),
    password : yup.string()
        .min(8, 'At least 8 characters are required')
        .required('Password is required')
        .matches(/[a-zA-Z]/, 'Must contain at least one letter')
        .matches(/[0-9]/, 'Must contain at least one number'),
    passwordNew : yup.string()
        .oneOf([yup.ref('password')], 'Passwords must be the same')
        .min(8, 'At least 8 characters are required')
        .required('Password is required')
        .matches(/[a-zA-Z]/, 'Must contain at least one letter')
        .matches(/[0-9]/, 'Must contain at least one number'),
});

export default function signUp(){
    const [visible, setVisible] = useState(false);
    const [newVisible, setNewVisible] = useState(false);

    const formik = useFormik({
        initialValues : {
            name : "",
            username : "",
            email : "",
            password : "",
            passwordNew : ""
        },
        validationSchema : SignUpSchema,
        onSubmit : async (values, {resetForm}) => {
            // Register the user for notifications
            const {passwordNew, ...data} = values;
            const tokenInput = await registerForPushNotifications() ?? '';

            // Perform the sign up
            await signup({
                token : tokenInput,
                name : data.name,
                username : data.username,
                password : data.password,
                email : data.email,
                onEnd : () => {resetForm()}
            });
        },
    });

    const registerForPushNotifications = async() => {
        // Used to attribute a push token to the specific project
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? 
                          Constants?.easConfig?.projectId;
    
        // Configure a notification channel
        await Notifications.setNotificationChannelAsync('Default', {
            name : 'Default',
            importance : Notifications.AndroidImportance.DEFAULT,
            vibrationPattern : [0, 250, 250, 250],  // vibrate, pause, vibrate, pause (ms)
            lightColor: '#FF231F7C'
        });
    
        // Check current permissions
        const {status : existingStatus} = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
    
        // Request permission if not granted
        if(finalStatus !== 'granted'){
            const {status} = await Notifications.requestPermissionsAsync();
            finalStatus = status;
            if(status !== 'granted'){
                showAlert('Attention', "You won't be able to receive notifications!");
                const {status} = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            };
        };
    
        if(!projectId){
            showAlert('Attention', 'Project id not found');
            return;
        };
    
        try{
            const pushToken = (await Notifications.getExpoPushTokenAsync({
                projectId : projectId
            })).data;
            return pushToken;
        } catch (err){
            console.log('Failed to generate push token : ', err);
            showAlert('Error', 'Failed to activate notifications');
        }
    };

    return(
        <SafeAreaView className = 'flex-1 bg-white'>
            <View className = "flex-1 items-center justify-start">
                <View className='flex flex-col w-[90%] gap-4 p-4'>
                    {/* Top navigation */}
                    <View className = "flex flex-row items-center">
                        <Link href = "/signIn" asChild>
                            <TouchableOpacity className='flex w-10 h-10 rounded-full border border-black items-center justify-center' >
                                <Ionicon name = "arrow-back-outline" size = {18}/>
                            </TouchableOpacity>
                        </Link>
                        <Text className = "text-2xl font-bold text-graphite py-8 px-4">
                            Sign up
                        </Text>
                    </View>  

                    {/* Field elements */}
                    <View className='flex flex-col'>
                        <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                            <Ionicon name = "person" color = {colors['Graphite']} size = {24}/>
                            <TextInput 
                                onChangeText = {formik.handleChange('name')}
                                value = {formik.values.name}
                                onBlur = {formik.handleBlur('name')}
                                placeholder='Name'
                                cursorColor={colors['Graphite']}
                                className = "flex-grow text-graphite ml-2"
                                placeholderTextColor={colors['Graphite']}
                            />
                        </View>
                        {formik.errors.name && formik.touched.name && 
                            <Text className = "font-bold text-error ml-2">{formik.errors.name}</Text>
                        }
                    </View>

                    <View className = "flex flex-col">
                        <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                            <Ionicon name = "at-outline" color = {colors['Graphite']} size = {24}/>
                            <TextInput 
                                onChangeText = {formik.handleChange('username')}
                                value = {formik.values.username}
                                onBlur = {formik.handleBlur('username')}
                                placeholder='Username'
                                cursorColor={colors['Graphite']}
                                className = "flex-grow text-graphite ml-2"
                                placeholderTextColor={colors['Graphite']}
                            />
                        </View>
                        {formik.errors.username && formik.touched.username && 
                            <Text className = "font-bold text-error ml-2">{formik.errors.username}</Text>
                        }
                    </View>
                    
                    <View className = "flex flex-col">
                        <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                            <Ionicon name = "mail-outline" color = {colors['Graphite']} size = {24}/>
                            <TextInput 
                                onChangeText = {formik.handleChange('email')}
                                value = {formik.values.email}
                                onBlur = {formik.handleBlur('email')}       // Inform formik the field was touched
                                placeholder='Email'
                                cursorColor={colors['Graphite']}
                                className = "flex-grow text-graphite ml-2"
                                placeholderTextColor={colors['Graphite']}
                            />
                        </View>
                        {formik.errors.email && formik.touched.email && 
                            <Text className = "font-bold text-error ml-2">{formik.errors.email}</Text>
                        }
                    </View>

                    <View className='flex flex-col'>
                        <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                            <Ionicon name = "key" color = {colors['Graphite']} size = {24}/>
                            <TextInput 
                                onChangeText = {formik.handleChange('password')}
                                value = {formik.values.password}
                                placeholder='Password'
                                onBlur = {formik.handleBlur('password')}
                                secureTextEntry={!visible}
                                cursorColor={colors['Graphite']}
                                className='flex-grow text-graphite ml-2'
                                placeholderTextColor={colors['Graphite']}
                            />
                            <Ionicon 
                                name = {visible ? "eye" : "eye-off"} 
                                size = {24}
                                color = {colors['Graphite']}
                                onPress = {() => setVisible(!visible)}
                            />
                        </View>
                        {formik.errors.password && formik.touched.password && 
                            <Text className = "font-bold text-error ml-2">{formik.errors.password}</Text>
                        }
                    </View>
                    
                    <View className='flex flex-col'>
                        <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                            <Ionicon name = "key" color = {colors['Graphite']} size = {24}/>
                            <TextInput 
                                className='flex-grow text-graphite ml-2'
                                onChangeText = {formik.handleChange('passwordNew')}
                                onBlur = {formik.handleBlur('passwordNew')}
                                value = {formik.values.passwordNew}
                                placeholder='Retype password'
                                secureTextEntry={!newVisible}
                                cursorColor={colors['Graphite']}
                                placeholderTextColor={colors['Graphite']}
                            />
                            <Ionicon 
                                name = {newVisible ? "eye" : "eye-off"} 
                                size = {24}
                                color = {colors['Graphite']}
                                onPress={() => {setNewVisible(!newVisible)}}
                            />
                        </View>
                        {formik.errors.passwordNew && formik.touched.passwordNew && 
                            <Text className = "font-bold text-error ml-2">{formik.errors.passwordNew}</Text>
                        }
                    </View>

                    {/* Submit button */}
                    <View className='flex flex-row py-4'>
                        <TouchableOpacity 
                            className='flex-1 bg-rose rounded-lg items-center py-4' 
                            onPress = {() => formik.handleSubmit()}
                        > 
                            <Text className='font-bold text-white' > 
                                {formik.isSubmitting ? 'Signing up ...' : 'Sign up'} 
                            </Text>
                        </TouchableOpacity>
                    </View> 
                </View>
            </View>
        </SafeAreaView>
    );
}

