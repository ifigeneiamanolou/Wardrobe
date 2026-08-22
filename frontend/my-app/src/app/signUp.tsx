import React, { useState } from 'react';
import * as yup from 'yup';
import {useFormik} from 'formik';
import constants from '../constants/app';
import showAlert from '../components/alert';
import '../../global.css';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { View, Button, TouchableOpacity, TextInput } from 'react-native';

const SignUpSchema = yup.object().shape({
    name : yup.string().required('Name is required'),
    username : yup.string().required('Username is required'),
    mail : yup.string().email('Email is invalid').required('Email is required'),
    password : yup.string().min(8, 'At least 8 characters are required').required('Password is required'),
    passwordNew : yup.string().oneOf([yup.ref('password')], 'Passwords must be the same')
});

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
        const requestObj = {
            method : "POST",
            headers : {'Content-Type' : 'application/json'},
            body : JSON.stringify(values)
        }

        const url = `${constants.BACKEND_URL}/new/account`;

        fetch(url, requestObj)
        .catch((reason) => {
            console.log(`Error from the server during sign up with reason ${reason}`);
            showAlert('Error', 'Server error ... Try again');
        })
        .finally(() => {
            resetForm();
        })
    },
})

export default function signUp(){
    const [visible, setVisible] = useState(false);
    const [newVisible, setNewVisible] = useState(false);

    return(
        <View className = "flex flex-col justify-center items-center">
            <View className = "flex flex-row">
                <Ionicon name = "person-add" size = {24}/>
                <TextInput 
                    onChangeText = {formik.handleChange('name')}
                    value = {formik.values.name}
                    placeholder='Name'
                />
            </View>

            <View className = "flex flex-row">
                <Ionicon name = "profile" size = {24}/>
                <TextInput 
                    onChangeText = {formik.handleChange('username')}
                    value = {formik.values.username}
                    placeholder='Username'
                />
            </View>

            <View className = "flex flex-row">
                <Ionicon name = "email" size = {24}/>
                <TextInput 
                    onChangeText = {formik.handleChange('email')}
                    value = {formik.values.email}
                    placeholder='Email'
                />
            </View>

            <View className = "flex flex-row">
                <Ionicon name = "password" size = {24}/>
                <TextInput 
                    onChangeText = {formik.handleChange('password')}
                    value = {formik.values.password}
                    placeholder='Password'
                    secureTextEntry={!visible}
                />
                <Ionicon 
                    name = {visible ? "eye" : "eye-off"} 
                    size = {24}
                    onPress = {() => setVisible(!visible)}
                />
            </View>

            <View className = "flex flex-row">
                <Ionicon name = "password" size = {24}/>
                <TextInput 
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
        </View>
    )
}