import React, { useEffect, useState } from "react";
import { Text , View, TouchableOpacity, FlatList} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import colors from "@/src/constants/colors";
import { User } from "@/src/types/cards";
import { useSession } from "@/src/ctx";
import { useRouter } from "expo-router";
import UserCard from "@/src/components/userCard";
import { loadFriends } from "@/src/apis/friends";
import LoadingDots from "react-native-loading-dots";

export default function Friends(){
    const [friends, setFriends] = useState<User[]>([]);
    const router = useRouter();
    const [noRessources, setNoRessources] = useState(false);
    const [loading, setLoading] = useState(false);
    const session = useSession();
    
    useEffect(() => {
        const fetchRessources = async () => {
            setLoading(true);
            await loadFriends({
                session : session,
                onEnd : (users : User[]) => {setFriends(users)},
                noRessources : () => {setNoRessources(true)}
            })
            setLoading(false);
        }
        fetchRessources();
    }, []);

    const deleteFriend = (username : string) => {
        console.log('friend deleted');
        // TO DO!!!!!!!!!!!!!
    };

    return(
        <View className="flex-1 p-4 bg-white">
            {/* Message or list of friends */}
            {loading ? (
                <View className='flex-1 h-12 justify-center items-center'>
                    <LoadingDots
                        dots = {3}
                        colors = {[colors['Blush'], colors['Blush'], colors['Blush']]}
                        size = {10}
                        gap = {2}
                    />
                </View>
            ) : noRessources ? (
                <View className = "flex-1 p-4 justify-center items-center">
                    <Text className = "font-bold text-dusty-rose text-2xl"> No friends found </Text>
                </View>
            ): (
                <FlatList
                    className='flex-1 bg-white'
                    ItemSeparatorComponent={() => <View className = "h-2"/>}
                    data = {friends}
                    renderItem={({item}) => (
                        <UserCard 
                            request = {'Friends'} 
                            item = {item}
                            onPress = {() => deleteFriend(item.username)}
                        />
                    )}
                />
            )}

            {/* Button to add friends */}
            <TouchableOpacity 
                className="bg-rose rounded-full" 
                style={{ position: 'absolute', right: 20, bottom: 20, zIndex: 50 }}
                onPress = {() => router.navigate('/tabs/account/addFriend')}
            >
                <Feather name = "plus" size = {32} color = {colors['White']} className = "p-2"/>
            </TouchableOpacity>
        </View>
    )
}