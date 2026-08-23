import React, { useState } from 'react';
import * as yup from 'yup';
import {useFormik} from 'formik';
import constants from '../constants/app';
import showAlert from '../components/alert';
import '../../global.css';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const SignUpSchema = yup.object().shape({
    name : yup.string().required('Name is required'),
    username : yup.string().required('Username is required'),
    mail : yup.string().email('Email is invalid').required('Email is required'),
    password : yup.string().min(8, 'At least 8 characters are required').required('Password is required'),
    passwordNew : yup.string().oneOf([yup.ref('password')], 'Passwords must be the same')
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
        onSubmit : (values, {resetForm}) => {
            // TO EXCLUDE PASSWORD NEW
            const requestObj = {
                method : "POST",
                headers : {'Content-Type' : 'application/json'},
                body : JSON.stringify(values)
            }

            const url = `${constants.BACKEND_URL}/signup`;

            fetch(url, requestObj)
            .catch((reason) => {
                console.log(`Error from the server during sign up with reason ${reason}`);
                showAlert('Error', 'Server error ... Try again');
            })
            .finally(() => {
                resetForm();
            })
        },
    });

    return( 
        <View className = "flex-1 justify-center items-center">
            <View className='flex flex-col border border-black bg-white w-[90%] gap-4 p-4 rounded-xl'>
                {/* Top navigation */}
                <View className = "flex flex-row items-center">
                    <Link href = "/signIn" asChild>
                        <TouchableOpacity className='flex w-10 h-10 rounded-full border border-black items-center justify-center' >
                            <Ionicon name = "arrow-back-outline" size = {18}/>
                        </TouchableOpacity>
                    </Link>
                    <Text className = "text-2xl font-bold px-4">
                        Sign up
                    </Text>
                </View>  

                {/* Field elements */}
                <View className = "flex flex-row items-center border border-gray-300 rounded-lg px-3 h-12 focus:border-sky-500">
                    <Ionicon name = "person" size = {24}/>
                    <TextInput 
                        onChangeText = {formik.handleChange('name')}
                        value = {formik.values.name}
                        placeholder='Name'
                        className = "mx-2"
                    />
                </View>

                <View className = "flex flex-row items-center border border-gray-300 rounded-lg px-3 h-12 focus:border-sky-500">
                    <Ionicon name = "at-outline" size = {24}/>
                    <TextInput 
                        onChangeText = {formik.handleChange('username')}
                        value = {formik.values.username}
                        placeholder='Username'
                        className = "mx-2"
                    />
                </View>

                <View className = "flex flex-row items-center border border-gray-300 rounded-lg px-3 h-12 focus:border-sky-500">
                    <Ionicon name = "mail-outline" size = {24}/>
                    <TextInput 
                        onChangeText = {formik.handleChange('email')}
                        value = {formik.values.email}
                        placeholder='Email'
                        className = "mx-2"
                    />
                </View>

                <View className = "flex flex-row items-center border border-gray-300 rounded-lg px-3 h-12 focus:border-sky-500">
                    <Ionicon name = "key" size = {24}/>
                    <TextInput 
                        onChangeText = {formik.handleChange('password')}
                        value = {formik.values.password}
                        placeholder='Password'
                        secureTextEntry={!visible}
                        className='flex-grow mx-2'
                    />
                    <Ionicon 
                        name = {visible ? "eye" : "eye-off"} 
                        size = {24}
                        onPress = {() => setVisible(!visible)}
                    />
                </View>

                <View className = "flex flex-row items-center border border-gray-300 rounded-lg px-3 h-12 focus:border-sky-500">
                    <Ionicon name = "key" size = {24}/>
                    <TextInput 
                        className='flex-grow mx-2'
                        onChangeText = {formik.handleChange('passwordNew')}
                        value = {formik.values.passwordNew}
                        placeholder='Retype password'
                        secureTextEntry={!newVisible}
                    />
                    <Ionicon 
                        name = {newVisible ? "eye" : "eye-off"} 
                        size = {24}
                        onPress={() => {setNewVisible(!newVisible)}}
                    />
                </View>

                {/* Submit button */}
                <View className='flex-row p-4 gap-4'>
                    <TouchableOpacity 
                        className='flex-1 border border-gray-500 rounded-lg items-center py-4' 
                        onPress = {() => formik.handleSubmit()}
                    > 
                        <Text className='font-bold ' > Sign up </Text>
                    </TouchableOpacity>
                </View>       
            </View>
        </View>
    );
}