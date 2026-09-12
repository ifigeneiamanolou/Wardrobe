import { View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {logOut} from '@/src/apis/auth';
import { useSession } from '@/src/ctx';
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from '@/src/constants/colors';
import { useRouter } from 'expo-router';

export default function Account() {
    const session = useSession();
    const router = useRouter();
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
            <View className = "flex items-center">
                <Ionicon name = "person-circle" size = {150} color = {colors['Blush']} />
                <Text className = "font-bold text-blush text-xl"> Username </Text>
                <Text className = "font-bold text-blush text-lg"> Email </Text>
            </View>

            {/* Menu navigation */}
            <View className = "flex flex-grow gap-4">
                {/* Friends */}
                <View className = "flex-1 flex-row bg-blush rounded-md  items-center gap-4 p-4">
                    <Ionicon name = "share-social" size = {24} color = {colors['White']}/>
                    <Text className = "flex grow font-bold text-lg text-white">Friends</Text>
                    <TouchableOpacity onPress = {() => {router.navigate("/tabs/account/friends")}}>
                        <Ionicon name = "arrow-forward" size = {24} color = {colors['White']}/>
                    </TouchableOpacity>
                </View>

                {/* Settings */}
                <View className = "flex-1 flex-row bg-blush rounded-md items-center gap-4 p-4">
                    <Ionicon name = "settings" size = {24} color = {colors['White']}/>
                    <Text className = "flex grow font-bold text-lg text-white">Settings</Text>
                    <TouchableOpacity onPress = {() => {router.navigate("/tabs/account/settings")}}>
                        <Ionicon name = "arrow-forward" size = {24} color = {colors['White']}/>
                    </TouchableOpacity>
                </View>

                {/* Notifications */}
                <View className = "flex-1 flex-row bg-blush rounded-md items-center gap-4 p-4">
                    <Ionicon name = "notifications" size = {24} color = {colors['White']} />
                    <Text className = "flex grow font-bold text-lg text-white">Notifications</Text>
                    <TouchableOpacity onPress = {() => {router.navigate("/tabs/account/notifications")}}>
                        <Ionicon name = "arrow-forward" size = {24} color = {colors['White']}/>
                    </TouchableOpacity>
                </View>

                {/* Privacy */}
                <View className = "flex-1 flex-row bg-blush rounded-md items-center gap-4 p-4">
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