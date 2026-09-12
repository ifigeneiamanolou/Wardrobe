import React, {useState, useEffect} from "react"
import { View, TextInput, FlatList, Text, TextInputChangeEvent } from "react-native"
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "@/src/constants/colors";
import UserCard from "@/src/components/userCard";
import { User } from "@/src/types/cards";
import { fetchUsers } from "@/src/apis/load";
import { useSession } from "@/src/ctx";

export default function AddFriend(){
    const [searchItem, setSearchItem] = useState<string | null>('');
    const [loading, setLoading] = useState<boolean>(true);
    const session = useSession();
    // Avoid losing data when filtering and having to reload from the db
    const [apiItems, setApiItems] = useState<User[]>();           
    const [filteredItems, setFilteredItems] = useState<User[]>();

    useEffect(() => {
        const getUsers = async() => {
            await fetchUsers({
                session : session,
                onEnd : (usersParam : User[]) => {
                    setApiItems(usersParam);
                    setFilteredItems(usersParam);
                    setLoading(false);
                }
            });
        };
        if(loading){
            getUsers();
        }
    }, []);

    const handleChange = (searchItem : string) => {
        setSearchItem(searchItem);
        const filteredItems = apiItems?.filter((item : User) => 
            item.username.toLowerCase().includes((searchItem ?? '').toLowerCase())
        );
        setFilteredItems(filteredItems);
    };

    return(
        <View className="flex-1 flex-col p-2 bg-white">
            <View className = "flex flex-row border border-border rounded-lg focus-within:color-dusty-rose items-center">
                <TextInput 
                    className = "flex-grow p-2"
                    placeholder = "Type a username"
                    value = {searchItem ?? ''}
                    onChangeText = {handleChange}
                />
                <Ionicon 
                    name = "search" 
                    size = {24} 
                    color = {colors['Graphite']} 
                    className = "p-4"
                />
            </View>

            {loading ? 
            <Text> Loading ...</Text>  // TO CHANGE !!!!!!!!!!!!!!!!
            : <FlatList 
                className = 'flex bg-white'
                ItemSeparatorComponent = {() => <View className = "h-2"/>}
                data = {filteredItems} 
                renderItem = {({item}) => (<UserCard item = {item}/>)}
            />}
        </View>
    )
}