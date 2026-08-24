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

const LoginSchema = yup.object().shape({
    name : yup.string().required("Email is required"),
    password : yup.string().min(8, "Password must be at least 8 characters").required("Password is required")
});

const url = `${constants.BACKEND_URL}/token`;

export default function Login(){
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePassword = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const context = useSession();

    const formik = useFormik({
        initialValues: {
            name : "",
            password : ""
        },
        validationSchema : LoginSchema,
        onSubmit(values, {resetForm}){       // Post request on form submit
            const configObj = {
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify(values)
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
                showAlert('Error', err);
            })
            .finally(() => {
                resetForm();
            })
        }
    });

    return(
        <View className='flex-1 items-center justify-center'>
            <View className='flex flex-col border border-black bg-white w-[90%] gap-4 p-4 rounded-xl'>
                <Text className = "text-2xl font-bold px-3">
                    Log In
                </Text>
                <View className = "flex flex-row items-center border border-gray-300 rounded-lg px-3 h-12 hover:border-sky-500">
                    <Ionicon name = "person" size = {24}/>
                    <TextInput 
                        placeholder='username' 
                        defaultValue={formik.values.name} 
                        onChangeText={formik.handleChange('name')}
                        keyboardType='email-address'
                        autoCapitalize='none'
                        className = "flex-grow "
                    />
                </View>

                <View className = "flex-row items-center border border-gray-300 rounded-lg px-3 h-12 hover:border-sky-500">
                    <Ionicon name = "key" size = {24}/>
                    <TextInput 
                        placeholder='password' 
                        defaultValue= {formik.values.password} 
                        onChangeText={formik.handleChange('password')}
                        secureTextEntry={!isPasswordVisible}
                        autoCapitalize='none'
                        className = "flex-grow"
                    />
                    <TouchableOpacity onPress={togglePassword}>
                        <Ionicon name = {isPasswordVisible ? "eye" : "eye-off"} size = {24}/>
                    </TouchableOpacity>
                   
                </View>
                
                <View className='flex flex-row p-4 gap-4'>
                    <TouchableOpacity 
                        className='flex-1 border border-gray-500 rounded-lg items-center py-4' 
                        onPress = {() => formik.handleSubmit()}
                    > 
                        <Text className='font-bold' > Log In </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className='flex-1 border border-gray-500 rounded-lg items-center py-4' 
                        onPress = {() => console.log('pressed google')}
                    > 
                        <Text className = "font-bold"> Google </Text>
                    </TouchableOpacity>
                </View>


                <View className='flex flex-row '>
                    <Text>
                        Don't have an account?
                    </Text>

                    <Link href = "./signUp"> 
                        <Text className='text-blue-400'>
                            Sign up 
                        </Text>
                    </Link>
                </View>
            </View>
        </View>
    );
}