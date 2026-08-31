import { View, TouchableOpacity, Text, TextInput } from "react-native";
import { Link } from "expo-router";
import Ionicon from "react-native-vector-icons/Ionicons";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";
import { useState } from "react";
import constants from "../constants/app";
import { useFormik } from "formik";
import showAlert from "../components/alert";
import colors from "../constants/colors";

const forgotSchema = yup.object().shape({
    username : yup.string().required('Username is required'),
    password : yup.string().min(8, 'At least 8 characters are required').required('Password is required'),
    passwordNew : yup.string().oneOf([yup.ref('password')]).required('Password is required'),
})

export default function changePassword(){
    // Password toggles
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isPasswordNewVisible, setIsPasswordNewVisible] = useState(false);
    const togglePassword = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };
    const toggleNewPassword = () => {
        setIsPasswordNewVisible(!isPasswordNewVisible);
    };

    // Form handling
    const formik = useFormik({
        initialValues : {
            username : "",
            password : "",
            passwordNew : "",
        },
        validationSchema : forgotSchema,
        onSubmit : (values, {resetForm}) => {
            const {passwordNew, ...data} = values;
            const requestObj = {
                "method" : "POST",
                "headers" : {"Content-Type" : "application/json"},
                "body" : JSON.stringify(data),
            }
            const url = `${constants['BACKEND_URL']}/change/password`;
            fetch(url, requestObj)
            .then(() => {
                showAlert('Success', 'Redirect to the login page');
            })
            .catch((reason : any) => {
                console.log(`Error from the server during sign up with reason ${reason}`);
                showAlert('Error', 'Server error ... Try again');
            })
            .finally(() => {
                resetForm();
            })
        },
    })

    return(
        <SafeAreaView className = 'flex-1 bg-white'>
            <View className = "flex-1 items-center justify-start">
                <View className='flex flex-col w-[90%] gap-4 p-4'>
                    {/* Back to login */}
                    <View className = "flex flex-row items-center">
                        <Link href = "/signIn" asChild>
                            <TouchableOpacity className='flex w-10 h-10 rounded-full border border-black items-center justify-center' >
                                <Ionicon name = "arrow-back-outline" size = {18}/>
                            </TouchableOpacity>
                        </Link>
                    </View> 

                    {/* Main content */}
                    <View>
                        {/* Title */}
                        <Text className = "text-2xl font-bold text-graphite py-8">
                            Forgot Password?
                        </Text>

                        <Text className = "text-2xl font-bold text-graphite py-8">
                            Don't worry, just change it!
                        </Text>

                        {/* Form fields */}
                        <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                            <Ionicon name = "at-outline" color = {colors['Graphite']} size = {24}/>
                            <TextInput 
                                onChangeText = {formik.handleChange('username')}
                                value = {formik.values.username}
                                placeholder='Username'
                                className = "flex-grow text-graphite ml-2"
                            />
                        </View>
                    
                        <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                            <Ionicon name = "key" color = {colors['Graphite']} size = {24}/>
                            <TextInput 
                                onChangeText = {formik.handleChange('password')}
                                value = {formik.values.password}
                                placeholder='Password'
                                secureTextEntry={!isPasswordVisible}
                                className='flex-grow text-graphite ml-2'
                            />
                            <Ionicon 
                                name = {isPasswordVisible ? "eye" : "eye-off"} 
                                size = {24}
                                color = {colors['Graphite']}
                                onPress = {togglePassword}
                            />
                        </View>

                        <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                            <Ionicon name = "key" color = {colors['Graphite']} size = {24}/>
                            <TextInput 
                                className='flex-grow text-graphite ml-2'
                                onChangeText = {formik.handleChange('passwordNew')}
                                value = {formik.values.passwordNew}
                                placeholder='Retype password'
                                secureTextEntry={!isPasswordNewVisible}
                            />
                            <Ionicon 
                                name = {isPasswordNewVisible ? "eye" : "eye-off"} 
                                size = {24}
                                color = {colors['Graphite']}
                                onPress={toggleNewPassword}
                            />
                        </View>

                        {/* Change password button */}
                        <View className='flex flex-row py-4'>
                            <TouchableOpacity 
                                className='flex-1 bg-rose rounded-lg items-center py-4' 
                                onPress = {() => formik.handleSubmit()}
                            > 
                                <Text className='font-bold text-white' > Continue </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};