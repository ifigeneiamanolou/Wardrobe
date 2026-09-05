import React, { useState, useEffect, useRef} from 'react';
import { Text, View, Button, TouchableOpacity, Image } from 'react-native';
import { Camera, CameraView, CameraType, FlashMode} from 'expo-camera';
import Ionicon from 'react-native-vector-icons/Ionicons';
import showAlert from '@/src/components/alert';
import colors from '@/src/constants/colors';
import EditImage from '../../components/editImage';
import PopUp from '@/src/components/popUp';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';


function Add(){
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [mediaPermission, setMediaPermission] = useState<boolean | null>(null)
    const [type, setType] = useState<CameraType>("back");
    const [image, setImage] = useState<string>("");
    const [flash, setFlash] = useState<FlashMode>('off');
    const cameraRef = useRef<CameraView>(null);
    const [showPopUp, setShowPopUp] = useState<boolean>(false);
    const [fadeBackground, setFadeBackground] = useState<boolean>(false);

    useEffect(() => {
        // FIX THE APPEARANCE OF THE BUTTON     !!!!!!!!!!!!
        requestPermission();
        requestMedia();
    }, []);

    const openPopUp = () => {
        setShowPopUp(!showPopUp);
        setFadeBackground(!fadeBackground);
    };

    const closePopUp = () => {
        setShowPopUp(!showPopUp);
        setFadeBackground(!fadeBackground);
        setImage("");
    };

    const requestPermission = async () => {
        const {status} = await Camera.requestCameraPermissionsAsync();
        console.log('Permission status:', status);
        setHasPermission(status == "granted");
    };

    const requestMedia = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Media status: ', status);
        setMediaPermission(status ==  "granted");
    }   

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
                const data = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    skipProcessing: false,
                });
                const source = new File(data.uri);
                const dest = new File(Paths.cache, `photo_${Date.now()}.jpg`);
                await source.copy(dest);
                setImage(dest.uri);
            } catch(err){
                console.log('Error when taking picture', err);
                showAlert('Error', 'Try taking a picture again!');
            }
        };
    };

    if (hasPermission === null || mediaPermission === null) {
        return <View />;
    }

    if (hasPermission === false ) {
        return(
            <View >
                <Text> We need your permission to show the camera </Text>
                <Button onPress={requestPermission} title="Grant permission" />
            </View>
        )
    }

    if(mediaPermission === false){
        return(
            <View >
                <Text> We need your permission to access the filesystem </Text>
                <Button onPress={requestMedia} title="Grant permission" />
            </View>
        )
    }

    return(
        <View className = "flex-1 bg-white">
            {/* Camera or image captured */}
            {!image ? 
            <CameraView style = {{'flex' : 1}} facing = {type} flash = {flash} ref = {cameraRef}/>
            : 
            <Image className = "flex-1" source = {{uri : image}} />
            }

            {/* Control buttons */}
            <View className = "absolute bottom-10 left-0 right-0 items-center">
                {!image ? 
                <View className = "flex flex-row gap-10">
                    <TouchableOpacity onPress = {takePicture}>
                        <Ionicon 
                            name = "camera" 
                            size = {48} 
                            color = {colors['White']}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress = {toggleType}>
                        <Ionicon 
                            name = {type === "back" ? "contrast-sharp" : "contrast-outline"} 
                            size = {48} 
                            color = {colors['White']}/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleFlash}>
                        <Ionicon 
                            name = {flash === "on" ? "flash" : "flash-off"}
                            size = {48} 
                            color = {colors['White']}/>
                    </TouchableOpacity>
                </View>
                : 
                <View className = "flex flex-row gap-10">
                    <TouchableOpacity onPress = {() => {setImage("")}}>
                        <Ionicon 
                            name = "reload" 
                            size = {48} 
                            color = {colors['White']}/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress = {openPopUp}>
                        <Ionicon 
                            name = "save"
                            size = {48} 
                            color = {colors['White']}/>
                    </TouchableOpacity>
                </View>
                }
            </View>

            {/* Pop up */}
            <PopUp visible = {showPopUp} modalVisible = {fadeBackground}>
                <EditImage onPress = {closePopUp} uri = {image} />
            </PopUp>
        </View>
    )
};

export default Add;