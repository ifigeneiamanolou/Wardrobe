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
});

const formik = useFormik({
    initialValues : {
        name : "",
        username : "",
        email : "",
        password : ""
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
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [newVisible, setNewVisible] = useState(false);

    return(
        <View className = "flex flex-col justify-center items-center">
            <View className = "flex flex-row">
                <Ionicon name = "person-add" size = {24}/>
                <TextInput 
                    onChange = {(v) => setName(v.toString())} 
                    value = {name}
                    placeholder='Name'
                />
            </View>

            <View className = "flex flex-row">
                <Ionicon name = "profile" size = {24}/>
                <TextInput 
                    onChange = {(v) => setUsername(v.toString())} 
                    value = {username}
                    placeholder='Username'
                />
            </View>

            <View className = "flex flex-row">
                <Ionicon name = "email" size = {24}/>
                <TextInput 
                    onChange = {(v) => setEmail(v.toString())} 
                    value = {email}
                    placeholder='Email'
                />
            </View>

            <View className = "flex flex-row">
                <Ionicon name = "password" size = {24}/>
                <TextInput 
                    onChange = {(v) => setPassword(v.toString())} 
                    value = {password}
                    placeholder='Password'
                    secureTextEntry={!visible}
                />
                <Ionicon name = {visible ? "eye" : "eye-off"} size  ={24}/>
            </View>

            <View className = "flex flex-row">
                <Ionicon name = "password" size = {24}/>
                <TextInput 
                    onChange = {(v) => setNewPassword(v.toString())} 
                    value = {newPassword}
                    placeholder='Retype password'
                    secureTextEntry={!newVisible}
                />
                <Ionicon name = {newVisible ? "eye" : "eye-off"} size = {24}/>
            </View>
        </View>
    )
}