import React, { useEffect, useState } from "react"
import { Text, FlatList, View } from "react-native"
import { User } from "@/src/types/cards"
import UserCard from "@/src/components/userCard";
import {loadRequests, acceptRequest } from "@/src/apis/friends";
import { useSession } from "@/src/ctx";
import LoadingDots from "react-native-loading-dots";
import colors from "@/src/constants/colors";
import showAlert from "@/src/components/alert";

export default function Notifications(){
    const [requests, setRequests] = useState<User[]>([]);
    const [noRessources, setNoRessources] = useState(false);
    const [loading, setLoading] = useState(false);
    const session = useSession();

    useEffect(() => {
        const fetchRessources = async () => {
            setLoading(true);
            await loadRequests({
                session : session,
                onEnd : (users : User[]) => {setRequests(users)},
                noRessources : () => {setNoRessources(true)}
            })
            setLoading(false);
        }
        fetchRessources();
    }, []);

    const pressAccept = async (username : string) => {
        await acceptRequest({
            username : username,        // Username from which the request came
            noRessources : () => {
                showAlert('Error', 'User or friendship not found');
                setRequests(requests?.filter((user : User) => {
                    return user.username !== username
                }))
            },
            onEnd : () => {
                showAlert('Success', `User ${username} is now on your friend list!`);
                setRequests(requests?.filter((user : User) => {
                    return user.username !== username
                }))
            },
            session : session
        })
    };

    return(
        <View className = "flex-1 bg-white p-2 gap-8">
            {loading ? (
                <View className='h-12 justify-center items-center'>
                    <LoadingDots
                        dots = {3}
                        colors = {[colors['Blush'], colors['Blush'], colors['Blush']]}
                        size = {10}
                        gap = {2}
                    />
                </View>
            ) : noRessources ? (
                <View className = "flex-1 p-4 justify-center items-center">
                    <Text className = "font-bold text-dusty-rose text-2xl"> No requests found </Text>
                </View>
            ): (
                <FlatList
                    data = {requests}
                    renderItem={({item}) => (
                        <UserCard 
                            request = {false} 
                            item = {item}
                            onPress={() => pressAccept(item.username)}
                        />
                    )}
                    ItemSeparatorComponent = {() => <View className="h-2"/>}
                    className = 'flex bg-white '
                />
            )}
        </View>
    )
}