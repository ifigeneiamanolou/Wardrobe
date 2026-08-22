import React from 'react';
import { View, TextInput, TouchableOpacity, Text} from 'react-native';
import { useFormik } from 'formik';
import { Link } from 'expo-router';
import * as yup from 'yup';
import constants from '../constants/app';
import { useState } from 'react';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { useSession } from '../ctx';

const LoginSchema = yup.object().shape({
    name : yup.string().required("Email is required"),
    password : yup.string().min(8, "Password must be at least 8 characters").required("Password is required")
});

const url = `${constants.BACKEND_URL}/login`;

export default function Login(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
            .then(response => {
                const dict = response.json();
                context?.signIn();   // sign in logic
            })
            .finally(() => {
                resetForm();
            })
        }
    });

    return(
        <View className='flex flex-col'>
            <View>
                <Ionicon name = "person" size = {24}/>
                <TextInput 
                    placeholder='username' 
                    defaultValue={username} 
                    onChange={v => setUsername(v.toString())}
                    keyboardType='email-address'
                    autoCapitalize='none'
                />
            </View>

            <View>
                <Ionicon name = "person" size = {24}/>
                <TextInput 
                    placeholder='password' 
                    defaultValue= {password} 
                    onChange={v => setPassword(v.toString())}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize='none'
               />
               <TouchableOpacity onPress={togglePassword}>
                    <Ionicon name = {isPasswordVisible ? "eye" : "eye-off"} size = {24}/>
               </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress = {() => formik.handleSubmit}> 
                <Text> Log in </Text>
            </TouchableOpacity>

            <View className='flex flex-row'>
                <Text>
                    Don't have an account?
                </Text>

                <Link href = "./signUp"> Sign up </Link>
            </View>
        </View>
    );
}