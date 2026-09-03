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
import {router} from 'expo-router';

const forgotSchema = yup.object().shape({
    username : yup.string()
        .required('Username is required')
        .min(2, 'Too short')
        .max(50, 'Too long'),
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
            const url = `${constants['BACKEND_URL']}/auth/change/password`;
            fetch(url, requestObj)
            .then((res) => {
                if(!res.ok){
                    throw new Error('Server rejected request');
                }
                showAlert('Success', 'Password has successfully changed');
                router.replace('/signIn');
            })
            .catch((reason : any) => {
                if(reason.name == "PasswordIsIdentical"){
                    console.log(`Identical password`);
                    showAlert('Error', 'A different password needs to be selected');
                }
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
                <View className='flex flex-col w-[90%] gap-8 p-4'>
                    {/* Top navigation */}
                    <View className = "flex flex-row items-center py-4">
                        <Link href = "/signIn" asChild>
                            <TouchableOpacity className='flex w-10 h-10 rounded-full border border-black items-center justify-center' >
                                <Ionicon name = "arrow-back-outline" size = {18}/>
                            </TouchableOpacity>
                        </Link>

                        <Text className = "text-2xl font-bold text-graphite px-4">
                            Forgot Password?
                        </Text>
                    </View> 

                    <View className="flex flex-col">
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
                        {formik.errors.username && formik.touched.username && 
                            <Text className = "font-bold text-error ml-2">{formik.errors.username}</Text>
                        }
                    </View>
                    
                    <View>
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
                        {formik.errors.password && formik.touched.password && 
                            <Text className = "font-bold text-error ml-2">{formik.errors.password}</Text>
                        }
                    </View>

                    <View>
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
                        {formik.errors.passwordNew && formik.touched.passwordNew && 
                            <Text className = "font-bold text-error ml-2">{formik.errors.passwordNew}</Text>
                        }
                    </View>

                    {/* Change password button */}
                    <View className='flex flex-row py-4'>
                        <TouchableOpacity 
                            className='flex-1 bg-rose rounded-lg items-center py-4' 
                            onPress = {() => formik.handleSubmit()}
                        > 
                            <Text className='font-bold text-white' > 
                                {formik.isSubmitting ? 'Submitting ...' : 'Continue'} 
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};