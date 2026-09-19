import React, { useEffect, useState } from "react"
import { Text, FlatList, View } from "react-native"
import { User } from "@/src/types/cards"
import UserCard from "@/src/components/userCard";
import {loadRequests, acceptRequest } from "@/src/apis/friends";
import { useSession } from "@/src/context/ctx";
import LoadingDots from "react-native-loading-dots";
import colors from "@/src/constants/colors";
import showAlert from "@/src/components/alert";
import { sendNotification } from "@/src/apis/friends";

export default function Notifications(){
    const [requests, setRequests] = useState<User[]>([]);
    const [noRessources, setNoRessources] = useState(false);
    const [loading, setLoading] = useState(false);
    const session = useSession();

    // Avoid sending to unregistered devices   MOVE TO CONTEXT !!!!!!!!!
    const [unregistered, setUnregistered] = useState<string[]>([]);

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

    const pressAccept = async (item : User) => {
        await acceptRequest({
            username : item.username,        // Username from which the request came
            noRessources : () => {
                showAlert('Error', 'User or friendship not found');
                setRequests(requests?.filter((user : User) => {
                    return user.username !== item.username
                }))
            },
            onEnd : async () => {
                showAlert('Success', `User ${item.username} is now on your friend list!`);
                setRequests(requests?.filter((user : User) => {
                    return user.username !== item.username
                }));
                await sendNotification({
                    push_token : item.push_token,
                    title : "Friend Request Accepted",
                    body : `User ${item.username} is now your friend!`,
                    username : item.username,
                    session : session,
                    onUnregistered : (push_token : string) => {
                        setUnregistered([...unregistered, push_token]);
                    }
                });
            },
            session : session
        })
    };

    return(
        <View className = "flex-1 bg-white p-4 gap-8">
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
                    <Text className = "font-bold text-dusty-rose text-2xl"> No requests found </Text>
                </View>
            ): (
                <FlatList
                    data = {requests}
                    renderItem={({item}) => (
                        <UserCard 
                            request = {'Accept'} 
                            item = {item}
                            onPress={() => pressAccept(item)}
                        />
                    )}
                    ItemSeparatorComponent = {() => <View className="h-2"/>}
                    className = 'flex bg-white '
                />
            )}
        </View>
    )
}