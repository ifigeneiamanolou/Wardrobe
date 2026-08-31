import React, { useState, useEffect, useRef} from 'react';
import { Text, View, Button, TouchableOpacity, Image } from 'react-native';
import { Camera, CameraView, CameraType, FlashMode} from 'expo-camera';
import Ionicon from 'react-native-vector-icons/Ionicons';
import showAlert from '@/src/components/alert';
import colors from '@/src/constants/colors';
import EditImage from '../../components/editImage';

function Add(){
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [type, setType] = useState<CameraType>("back");
    const [image, setImage] = useState<string | null>(null);
    const [flash, setFlash] = useState<FlashMode>('off');
    const cameraRef = useRef<CameraView>(null);
    const [showPopUp, setShowPopUp] = useState<boolean>(false);

    useEffect(() => {
        async() => {
            const {status} = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        }
    }, []);

    const changePopUp = () => {
        setShowPopUp(!showPopUp);
    };

    const requestPermission = async () => {
        const {status} = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status == "granted");
    };

    const toggleType = () => {
        setType(current =>
            current === "back" ? "front" : "back"
        );
    };

    const toggleFlash = () => {
        setFlash( current =>
            current === "on" ? "off" : "on"
        );
    };

    const takePicture = async () => {
        if(cameraRef.current){
            try{
                const data = await cameraRef.current.takePictureAsync();
                setImage(data.uri);
            } catch(err){
                console.log('Error when taking picture', err);
                showAlert('Error', 'Try taking a picture again!');
            }
        };
    };

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return(
            <View >
                <Text> We need your permission to show the camera </Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        )
    }

    return(
        <View className='flex-1'>
            {/* Camera or image captured */}
            {!image ? 
            <CameraView facing = {type} flash = {flash} ref = {cameraRef}/>
            : 
            <Image source = {{uri : image}} className = '' />
            }

            {/* Control buttons */}
            <View>
                {image ? 
                <View>
                    <TouchableOpacity onPress = {takePicture}>
                        <Ionicon name = "camera" size = {24} color = {colors['White']}/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress = {toggleType}>
                        <Ionicon 
                            name = {type === "back" ? "contrast-sharp" : "contrast-outline"} 
                            size = {24} 
                            color = {colors['White']}/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleFlash}>
                        <Ionicon 
                            name = {flash === "on" ? "flash" : "flash-off"}
                            size = {24} 
                            color = {colors['White']}/>
                    </TouchableOpacity>
                </View>
                : 
                <View>
                    <TouchableOpacity onPress = {() => setImage(null)}>
                        <Ionicon 
                            name = "reload" 
                            size = {24} 
                            color = {colors['White']}/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress = {changePopUp}>
                        <Ionicon 
                            name = "save"
                            size = {24} 
                            color = {colors['White']}/>
                    </TouchableOpacity>
                </View>
                }
            </View>

            {/* Pop up */}
            <EditImage onPress = {changePopUp} showPopUp = {showPopUp} uri = {image} />
        </View>
    )
};

export default Add;