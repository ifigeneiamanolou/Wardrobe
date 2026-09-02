import React from 'react';
import { View, TextInput, TouchableOpacity, Text} from 'react-native';
import { useFormik } from 'formik';
import { Link } from 'expo-router';
import * as yup from 'yup';
import { useState } from 'react';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { useSession } from '../ctx';
import showAlert from '../components/alert';
import constants from '../constants/app';
import '../../global.css';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const LoginSchema = yup.object().shape({
    username : yup.string()
        .required("Username is required"),
    password : yup.string()
        .required("Password is required")
});

export default function Login(){
    // useEffect(() => {
    //     GoogleSignin.configure({
    //         webClientId : "557827216767-er77mu4c9vivgv1ln9g8020e6vb2m3f5.apps.googleusercontent.com",
    //         offlineAccess : true
    //     });
    // }, []);
    
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const togglePassword = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const context = useSession();
    const formik = useFormik({
        initialValues: {
            username : "",
            password : ""
        },
        validationSchema : LoginSchema,
        onSubmit(values, {resetForm}){       // Post request on form submit
            const url = `${constants.BACKEND_URL}/auth/token`;
            const data = new URLSearchParams({
                "username" : values.username,
                "password" : values.password
            })
            const configObj = {
                method : "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body : data.toString()
            };
            fetch(url, configObj)
            .then(async (response) => {
                if(!response.ok){
                    throw new Error('Log in failed');
                }
                const dict = await response.json();
                context?.signIn(dict);   // sign in
            })
            .catch((err) => {
                console.log("Log in error", err);
                showAlert('Error', err.message);
            })
            .finally(() => {
                resetForm();
            })
        }
    });

    const googleLog = async () => {
        // try{
        //     // Check play services
        //     await GoogleSignin.hasPlayServices();

        //     // Sign in
        //     const userInfo = await GoogleSignin.signIn();
        //     console.log("User Info:", userInfo);
        // } catch (err : any){
        //     console.log('Google sign in error, ', err);
        //     if(err.code == statusCodes.SIGN_IN_CANCELLED){
        //         showAlert('Canceled', 'User sign in cancelled');
        //     } else if (err.code == statusCodes.PLAY_SERVICES_NOT_AVAILABLE){
        //         showAlert('Not available', 'Google play services not available');
        //     } else if (err.code == statusCodes.IN_PROGRESS){
        //         showAlert('In progress', 'Sign in already in progress');
        //     } else {
        //         showAlert('Error', err.message);
        //     }
        // }
    };

    return(
        <SafeAreaView className = 'flex-1 bg-white'>
            <View className='flex-1 items-center justify-start'>
                <View className='flex flex-col w-[90%] gap-4 p-4'>
                    {/* Top text */}
                    <Text className = "text-2xl font-bold text-graphite py-8">
                        Log In
                    </Text>

                    {/* Fields */}
                    <View className='flex flex-col'>
                        <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                            <Ionicon name = "person" size = {24} color={colors['Graphite']}/>
                            <TextInput 
                                placeholder='Username' 
                                defaultValue={formik.values.username} 
                                onChangeText={formik.handleChange('username')}
                                autoCapitalize='none'
                                className = "flex-grow text-graphite ml-2"
                            />
                        </View>
                        {formik.errors.username && formik.touched.username && 
                            <Text className = "font-bold text-error ml-2">{formik.errors.username}</Text>
                        }
                    </View>

                    <View className = "flex flex-col">
                        <View className = "flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:border-dusty-rose">
                            <Ionicon name = "key" size = {24} color = {colors['Graphite']}/>
                            <TextInput 
                                placeholder='Password' 
                                defaultValue= {formik.values.password} 
                                onChangeText={formik.handleChange('password')}
                                secureTextEntry={!isPasswordVisible}
                                autoCapitalize='none'
                                className = "flex-grow text-graphite ml-2"
                            />
                            <TouchableOpacity onPress={togglePassword}>
                                <Ionicon name = {isPasswordVisible ? "eye" : "eye-off"} size = {24} color = {colors['Graphite']}/>
                            </TouchableOpacity>
                        </View>
                        {formik.errors.password && formik.touched.password && 
                            <Text className = "font-bold text-error ml-2">{formik.errors.password}</Text>
                        }
                    </View>

                    {/* Forgot password navigation */}
                    <View className = "flex flex-row justify-end">
                        <TouchableOpacity className = "">
                            
                            <Link href = "./forgotPassword"> 
                                <Text className = 'text-link font-bold'> Forgot Password? </Text>
                            </Link>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Log in button */}
                    <View className='flex flex-row py-4'>
                        <TouchableOpacity 
                            className='flex-1 bg-rose rounded-lg items-center py-4' 
                            onPress = {() => formik.handleSubmit()}
                        > 
                            <Text className='font-bold text-white' > 
                                {formik.isSubmitting ? 'Logging in ...' : 'Continue' }
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View className = 'flex flex-row items-center gap-3'>
                        <View className = 'flex-1 h-[1px] bg-border' />
                        <Text className = 'w-50 text-center text-slate-gray'> or </Text>
                        <View className = 'flex-1 h-[1px] bg-border' />
                    </View>

                    {/* Sign in with google or apple */}
                    <View className='flex flex-col gap-4'>
                        <TouchableOpacity 
                            className='flex flex-row border border-slate-gray rounded-lg items-center justify-center py-4' 
                            onPress = {() => googleLog()}
                        > 
                            <Ionicon name="logo-google" color={colors['Graphite']} size={24} />
                            <Text className='font-bold text-graphite' > Log in with Google </Text>
                        </TouchableOpacity>
        
                        <TouchableOpacity 
                            className='flex flex-row border border-slate-gray rounded-lg items-center py-4 justify-center' 
                            onPress = {() => formik.handleSubmit()}
                        > 
                            <Ionicon name="logo-apple" color={colors['Graphite']} size={24} />
                            <Text className='font-bold text-graphite' > Log in with Apple </Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Sign up navigation */}
                    <View className='flex flex-row justify-center gap-2'>
                        <Text> Don't have an account? </Text>

                        <Link href = "./signUp"> 
                            <Text className='text-dusty-rose'> Sign up </Text>
                        </Link>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}