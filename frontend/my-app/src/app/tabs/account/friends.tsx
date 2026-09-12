import React, { useEffect, useState } from "react";
import { Text , View, TouchableOpacity, FlatList} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import colors from "@/src/constants/colors";
import { User } from "@/src/types/cards";
import { useRouter } from "expo-router";
import FriendCard from "@/src/components/friendCard";

export default function Friends(){
    const [friends, setFriends] = useState<User[]>([]);
    const router = useRouter();

    useEffect(() => {

    }, []);

    return(
        <View className="flex-1">
            {/* Message or list of friends */}
            {friends.length == 0 ?
            <View className = "flex-1 p-4 justify-center items-center">
                <Text className = "font-bold text-dusty-rose text-2xl"> No friends found </Text>
            </View>
            :
                <FlatList
                    className='flex-1 bg-white'
                    ItemSeparatorComponent={() => <View className = "h-2"/>}
                    data = {friends}
                    renderItem={({item}) => (<FriendCard item = {item}/>)}
                />
            }

            {/* Button to add friends */}
            <TouchableOpacity 
                className="bg-rose rounded-full" 
                style={{ position: 'absolute', right: 16, bottom: 16, zIndex: 50 }}
                onPress = {() => router.navigate('/tabs/account/addFriend')}
            >
                <Feather name = "plus" size = {24} color = {colors['White']} className = "p-2"/>
            </TouchableOpacity>

        </View>
    )
}