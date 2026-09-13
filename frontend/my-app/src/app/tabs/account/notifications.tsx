import React, { useState } from "react"
import { Text, FlatList, View } from "react-native"
import { User } from "@/src/types/cards"
import UserCard from "@/src/components/userCard";

export default function Notifications(){
    const [requests, setRequests] = useState<User[]>([]);
    return(
        <View className = "flex-1 bg-white p-2">
            <FlatList
                data = {requests}
                renderItem={({item}) => (
                    <UserCard 
                        request = {false} 
                        item = {item}
                        onPress={(username : string) => {
                            setRequests(requests?.filter((user : User) => {
                                return user.username == username
                            }))
                        }}
                    />
                )}
                ItemSeparatorComponent = {() => <View className="h-2"/>}
                className = 'flex bg-white '
            />
        </View>
    )
}