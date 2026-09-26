import React, { useState, useEffect } from "react";
import { View } from "react-native";
import PermissionSwitch from "@/src/components/permissionContainer";
import * as Notifications from 'expo-notifications';
import {Camera} from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import showAlert from "@/src/components/alert";

export default function Privacy(){
    const [statusCamera, setStatusCamera] = useState<boolean>(false);
    const [statusNotifications, setStatusNotifications] = useState<boolean>(false);
    const [statusFile, setStatusFile] = useState<boolean>(false);

    useEffect(() => {
        const checkPermissionsCamera = async () => {
            const {status} = await Camera.getCameraPermissionsAsync();
            setStatusCamera(status == 'granted');
        }

        const checkPermissionsNotifications = async() => {
            const {status} = await Notifications.getPermissionsAsync();
            setStatusCamera(status == 'granted');
        }

        const checkPermissionsFiles = async() => {
            const {status} = await ImagePicker.getMediaLibraryPermissionsAsync();
            setStatusCamera(status == 'granted');
        }

        checkPermissionsCamera();
        checkPermissionsFiles();
        checkPermissionsNotifications();

    }, []);

    const handleCamera = async () => {
        const {status} = await Camera.requestCameraPermissionsAsync();
        if(status !== 'granted'){
            showAlert('Warning', "You won't be able to add new items! Change permissions.");
        }
        setStatusCamera(status == 'granted');
    };

    const handleFileSystem = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(status !== 'granted'){
            showAlert('Warning', "You won't be able to add new items! Change permissions.");
        }
        setStatusFile(status == 'granted');
    };

    const handleNotifications = async () => {
        const {status} = await Notifications.requestPermissionsAsync();
        if(status !== 'granted'){
            showAlert('Warning', "You won't be able to receive notifications! Change permissions.");
        }
        setStatusNotifications(status == 'granted');
    };

    return(
        <View className="flex flex-col p-2 gap-4">
            <PermissionSwitch
                label = "Camera"
                initialValue = {statusCamera}
                changePermissions={handleCamera}
            />

            <PermissionSwitch
                label = "Filesystem"
                initialValue = {statusFile}
                changePermissions={handleFileSystem}
            />

            <PermissionSwitch
                label = "Notifications"
                initialValue = {statusNotifications}
                changePermissions={handleNotifications}
            />
        </View>
    )
}