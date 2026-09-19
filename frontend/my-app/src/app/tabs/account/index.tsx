import { View, Text, TouchableOpacity, Image} from 'react-native';
import React, {useState, useEffect} from 'react';
import {logOut} from '@/src/apis/auth';
import { useSession } from '@/src/context/ctx';
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from '@/src/constants/colors';
import { useRouter } from 'expo-router';
import { fetchProfile } from '@/src/apis/load';
import LoadingDots from "react-native-loading-dots";

export default function Account() {
    const session = useSession();
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        const loadDetails = async() => {
            const response = await fetchProfile({session : session});
            if(response){
                setEmail(response['email']);
                setUsername(response['username']);
                setUrl(response['url']);
            };
            setIsLoading(false);
        };

        if(email == null || username == null || url == null){
            loadDetails();
        };
    }, []);

    return(
        <View className = "flex-1 flex-col p-4 gap-4 bg-white ">
            {/* Edit button */}
            <View className = "flex items-end">
                <TouchableOpacity   
                    className = "flex flex-row w-24 rounded-lg bg-blush gap-2 p-2 justify-center items-center"
                    onPress = {() => {router.navigate("/tabs/account/edit")}}
                >
                    <Ionicon name = "pencil" size = {22} color = {colors['White']}/>
                    <Text className = "font-bold text-white text-xl">Edit</Text>
                </TouchableOpacity>
            </View>

            {/* User details */}
            <View className = "flex items-center gap-3">
                {url ? 
                <Image 
                    source = {{uri : `data:image/png;base64,${url}`}} 
                    className="rounded-full"
                    style = {{width : 150, height : 150}} 
                    onError={(error) => {
                        console.log(error.nativeEvent.error);
                        setUrl(null);
                    }}
                />
                : <Ionicon name = "person-circle" size = {150} color = {colors['Blush']} />
                }
                {isLoading ?
                <View className='h-12 justify-center items-center'>
                    <LoadingDots
                        dots = {3}
                        colors = {[colors['Blush'], colors['Blush'], colors['Blush']]}
                        size = {10}
                        gap = {2}
                    />
                </View>
                : <>
                <Text className = "font-bold text-blush text-xl"> {username} </Text>
                <Text className = "font-bold text-blush text-lg"> {email} </Text>
                </>
                }
            </View>

            {/* Menu navigation */}
            <View className = "flex-1 flex-grow gap-4 pt-2">
                {/* Friends */}
                <View className = "flex-1 flex-row bg-blush rounded-md  items-center gap-4 p-2">
                    <Ionicon name = "share-social" size = {24} color = {colors['White']}/>
                    <Text className = "flex grow font-bold text-lg text-white">Friends</Text>
                    <TouchableOpacity onPress = {() => {router.navigate("/tabs/account/friends")}}>
                        <Ionicon name = "arrow-forward" size = {24} color = {colors['White']}/>
                    </TouchableOpacity>
                </View>

                {/* Settings */}
                <View className = "flex-1 flex-row bg-blush rounded-md items-center gap-4 p-2">
                    <Ionicon name = "settings" size = {24} color = {colors['White']}/>
                    <Text className = "flex grow font-bold text-lg text-white">Settings</Text>
                    <TouchableOpacity onPress = {() => {router.navigate("/tabs/account/settings")}}>
                        <Ionicon name = "arrow-forward" size = {24} color = {colors['White']}/>
                    </TouchableOpacity>
                </View>

                {/* Notifications */}
                <View className = "flex-1 flex-row bg-blush rounded-md items-center gap-4 p-2">
                    <Ionicon name = "notifications" size = {24} color = {colors['White']} />
                    <Text className = "flex grow font-bold text-lg text-white">Notifications</Text>
                    <TouchableOpacity onPress = {() => {router.navigate("/tabs/account/notifications")}}>
                        <Ionicon name = "arrow-forward" size = {24} color = {colors['White']}/>
                    </TouchableOpacity>
                </View>

                {/* Privacy */}
                <View className = "flex-1 flex-row bg-blush rounded-md items-center gap-4 p-2">
                    <Ionicon name = "lock-closed" size = {24} color = {colors['White']}/>
                    <Text className = "flex grow font-bold text-lg text-white">Security and permissions</Text>
                    <TouchableOpacity onPress = {() => {router.navigate("/tabs/account/privacy")}}>
                        <Ionicon name = "arrow-forward" size = {24} color = {colors['White']}/>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Sign out button */}
            <View className = "flex p-2">
                <TouchableOpacity 
                    className = "flex flex-row rounded-lg bg-light-red gap-2 p-2 justify-center items-center"
                    onPress = {() => {logOut({session})}}
                >
                    <Ionicon name = "log-out" size = {22} color = {colors['White']}/>
                    <Text className = "font-bold text-white text-xl">Log out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}