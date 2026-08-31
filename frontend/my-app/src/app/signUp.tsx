import React, { useState } from 'react';
import * as yup from 'yup';
import {useFormik} from 'formik';
import constants from '../constants/app';
import showAlert from '../components/alert';
import '../../global.css';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';

const SignUpSchema = yup.object().shape({
    name : yup.string().required('Name is required'),
    username : yup.string().required('Username is required'),
    mail : yup.string().email('Email is invalid').required('Email is required'),
    password : yup.string().min(8, 'At least 8 characters are required').required('Password is required'),
    passwordNew : yup.string().optional().oneOf([yup.ref('password')], 'Passwords must be the same')
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
            const {passwordNew, ...data} = values;
            const requestObj = {
                method : "POST",
                headers : {'Content-Type' : 'application/json'},
                body : JSON.stringify(data)
            }

            const url = `${constants.BACKEND_URL}/signup`;
            fetch(url, requestObj)
            .then(() => {
                showAlert('Success', 'Redirect to the log in page');
            })
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
                        <Text className = "text-2xl font-bold text-graphite py-8">
                            Sign up
                        </Text>
                    </View>  

                    {/* Field elements */}
                    <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                        <Ionicon name = "person" color = {colors['Graphite']} size = {24}/>
                        <TextInput 
                            onChangeText = {formik.handleChange('name')}
                            value = {formik.values.name}
                            placeholder='Name'
                            className = "flex-grow text-graphite ml-2"
                        />
                    </View>

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
                        <Ionicon name = "mail-outline" color = {colors['Graphite']} size = {24}/>
                        <TextInput 
                            onChangeText = {formik.handleChange('email')}
                            value = {formik.values.email}
                            placeholder='Email'
                            className = "flex-grow text-graphite ml-2"
                        />
                    </View>

                    <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                        <Ionicon name = "key" color = {colors['Graphite']} size = {24}/>
                        <TextInput 
                            onChangeText = {formik.handleChange('password')}
                            value = {formik.values.password}
                            placeholder='Password'
                            secureTextEntry={!visible}
                            className='flex-grow text-graphite ml-2'
                        />
                        <Ionicon 
                            name = {visible ? "eye" : "eye-off"} 
                            size = {24}
                            color = {colors['Graphite']}
                            onPress = {() => setVisible(!visible)}
                        />
                    </View>

                    <View className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                        <Ionicon name = "key" color = {colors['Graphite']} size = {24}/>
                        <TextInput 
                            className='flex-grow text-graphite ml-2'
                            onChangeText = {formik.handleChange('passwordNew')}
                            value = {formik.values.passwordNew}
                            placeholder='Retype password'
                            secureTextEntry={!newVisible}
                        />
                        <Ionicon 
                            name = {newVisible ? "eye" : "eye-off"} 
                            size = {24}
                            color = {colors['Graphite']}
                            onPress={() => {setNewVisible(!newVisible)}}
                        />
                    </View>

                    {/* Submit button */}
                    <View className='flex flex-row py-4'>
                        <TouchableOpacity 
                            className='flex-1 bg-rose rounded-lg items-center py-4' 
                            onPress = {() => formik.handleSubmit()}
                        > 
                            <Text className='font-bold text-white' > Sign up </Text>
                        </TouchableOpacity>
                    </View>  
                </View>
            </View>
        </SafeAreaView>
    );
}

