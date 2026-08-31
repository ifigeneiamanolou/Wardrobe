import React, { useState, useEffect} from 'react';
import { Text, View, Button, TouchableOpacity } from 'react-native';
import { Camera, CameraView, CameraType} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from '../constants/colors';

const CameraScreen = () => {
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [hasMediaPermission, setHasMediaPermission] = useState<boolean>(false);
    const [type, setType] = useState<CameraType>();

    useEffect(() => {
        async() => {
            const {status} = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status == "granted");
        }
    }, []);

    const requestPermission = async () => {
        const {status} = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status == "granted");
    };

    const toggleType = () => {
        setType(current =>
            current == "back" ? "front" : "back"
        );
    };

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return(
            <View >
                <Text>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        )
    }

    return(
        <View className='flex-1'>
            <CameraView facing = {type}/>
            <View>
                <TouchableOpacity>
                    <Ionicon name = "camera" size = {24} color = {colors['White']}/>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Ionicon name = "refresh-outline" size = {24} color = {colors['White']}/>
                </TouchableOpacity>
            </View>
        </View>
    )
};

export default CameraScreen;