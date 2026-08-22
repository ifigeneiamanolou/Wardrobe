import React from 'react';
import { View, TextInput, TouchableOpacity, Text} from 'react-native';
import { useFormik } from 'formik';
import { Link } from 'expo-router';
import * as yup from 'yup';
import constants from '../constants/app';
import { useState } from 'react';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { useSession } from '../ctx';
import showAlert from '../components/alert';

const LoginSchema = yup.object().shape({
    name : yup.string().required("Email is required"),
    password : yup.string().min(8, "Password must be at least 8 characters").required("Password is required")
});

const url = `${constants.BACKEND_URL}/login`;

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
                context?.signIn();   // sign in
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
        <View className='flex flex-col'>
            <View>
                <Ionicon name = "person" size = {24}/>
                <TextInput 
                    placeholder='username' 
                    defaultValue={formik.values.name} 
                    onChangeText={formik.handleChange('name')}
                    keyboardType='email-address'
                    autoCapitalize='none'
                />
            </View>

            <View>
                <Ionicon name = "person" size = {24}/>
                <TextInput 
                    placeholder='password' 
                    defaultValue= {formik.values.password} 
                    onChangeText={formik.handleChange('password')}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize='none'
               />
               <TouchableOpacity onPress={togglePassword}>
                    <Ionicon name = {isPasswordVisible ? "eye" : "eye-off"} size = {24}/>
               </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress = {() => formik.handleSubmit()}> 
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