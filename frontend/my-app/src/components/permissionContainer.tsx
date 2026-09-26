import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import colors from '../constants/colors';

type props = {
    label : string;
    initialValue : boolean;
    changePermissions : () => void;
}

export default function PermissionSwitch({label, changePermissions, initialValue} : props){

    return(
        <View className='flex flex-row'>
            <Text className='flex text-dusty-rose font-bold text-xl'>{label}: </Text>
            <Text 
                style = {initialValue ? {color : colors['Success']} : {color : colors['Warning']}}
                className='flex flex-grow font-bold text-xl'
            >
                {initialValue ? 'Accepted': 'Denied'}
            </Text>

            <TouchableOpacity 
                className='flex bg-rose rounded-lg justify-center items-center'
                onPress={changePermissions}
            >
                <Text className='text-white font-bold text-basis'>Change status</Text>
            </TouchableOpacity>
        </View>

    );
}