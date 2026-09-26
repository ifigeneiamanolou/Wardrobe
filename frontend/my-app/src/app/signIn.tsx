import React from 'react';
import { View, TextInput, TouchableOpacity, Text} from 'react-native';
import { useFormik } from 'formik';
import { Link } from 'expo-router';
import * as yup from 'yup';
import { useState, useEffect } from 'react';
import Ionicon from 'react-native-vector-icons/Ionicons';
import '../../global.css';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import { login, googleSubmit } from '../apis/auth';
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import showAlert from '../components/alert';
import { useSession } from '../context/ctx';
import AnimatedBag from '../components/bouncingAnimation';
import { oauth_google } from '../constants/secrets';

const LoginSchema = yup.object().shape({
    username : yup.string()
        .required("Username is required"),
    password : yup.string()
        .required("Password is required")
});

export default function Login(){
    useEffect(() => {
        GoogleSignin.configure({
            webClientId : oauth_google.client_id,
            scopes: ['profile', 'email'],
        });
    }, []);
    
    const session = useSession();
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const togglePassword = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };
    const [loading, setLoading] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            username : "",
            password : ""
        },
        validationSchema : LoginSchema,
        onSubmit: async (values, {resetForm}) => {      
            setLoading(true);
            await login({
                username : values.username,
                password : values.password,
                onEnd : () => resetForm(),
                session : session
            });
            setLoading(false);
        }
    });

    const googleLogIn = async () => {
        try{
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            // send to backend for validation (email, id token!)
            await googleSubmit({
                session : session,
                idToken : userInfo.data?.idToken ?? '',
            })
        } catch (err : any){
            console.log('Google sign in error, ', err);
            if(err.code == statusCodes.SIGN_IN_CANCELLED){
                showAlert('Canceled', 'User sign in was cancelled');
            } else if (err.code == statusCodes.PLAY_SERVICES_NOT_AVAILABLE){
                showAlert('Not available', 'Google play services not available');
            } else if (err.code == statusCodes.IN_PROGRESS){
                showAlert('In progress', 'Sign in already in progress');
            } else {
                showAlert('Error', 'Google sign is not possible!');
            }
        }
    };

    return(
        <SafeAreaView 
            className = 'flex-1 bg-white'
        >   
            {loading ? (
                <AnimatedBag label = "Wait while we validate your details ..."/>
            ) : (
                <View className='flex-1 items-center justify-start'>
                    <View className='flex flex-col w-[90%] gap-4 p-4'>
                        {/* Top text */}
                        <Text className = "text-2xl font-bold text-graphite py-8">
                            Sign In
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
                                    placeholderTextColor={colors['Graphite']}
                                    cursorColor={colors['Graphite']}
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
                                    placeholderTextColor={colors['Graphite']}
                                    cursorColor={colors['Graphite']}
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
                                    Continue
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
                                className='flex flex-row border border-slate-gray rounded-lg items-center justify-center p-1 gap-1' 
                                onPress = {() => googleLogIn()}
                            > 
                                <Ionicon name = "logo-google" size = {24} color = {colors['Graphite']}/>
                                <Text className='font-bold text-graphite' > Sign in with Google </Text>
                            </TouchableOpacity>
            
                            <TouchableOpacity 
                                className='flex flex-row border border-slate-gray rounded-lg items-center p-1 justify-center gap-1' 
                                onPress = {() => formik.handleSubmit()}
                            > 
                                <Ionicon name="logo-apple" color={colors['Graphite']} size={24} />
                                <Text className='font-bold text-graphite' > Sign in with Apple </Text>
                            </TouchableOpacity>
                        </View>
                        
                        {/* Sign up navigation */}
                        <View className='flex flex-row justify-center gap-2'>
                            <Text> Don't have an account? </Text>

                            <Link href = "./signUp"> 
                                <Text className='text-link font-bold'> Sign up </Text>
                            </Link>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}