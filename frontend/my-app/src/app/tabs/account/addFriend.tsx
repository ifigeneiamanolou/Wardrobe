import React, {useState, useEffect, useRef} from "react"
import { View, TextInput, FlatList, Text, TouchableOpacity } from "react-native"
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "@/src/constants/colors";
import UserCard from "@/src/components/userCard";
import { User } from "@/src/types/cards";
import { fetchUsers } from "@/src/apis/load";
import { useSession } from "@/src/context/ctx";
import { makeRequest } from "@/src/apis/friends";
import LoadingDots from "react-native-loading-dots";
import showAlert from "@/src/components/alert";
import { sendNotification } from "@/src/apis/friends";

export default function AddFriend(){
    const [searchItem, setSearchItem] = useState<string | null>('');
    const [loading, setLoading] = useState<boolean>(true);
    const session = useSession();

    // Avoid losing data when filtering and having to reload from the db
    const [apiItems, setApiItems] = useState<User[]>();     
    const [filteredItems, setFilteredItems] = useState<User[]>([]);

    // Avoid sending to unregistered devices
    const [unregistered, setUnregistered] = useState<string[]>([]);

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

    const onSuccessfulRequest = async (item : User) => {
        // Remove the friend requested from the list of users
        setApiItems(apiItems?.filter((user : User) => {
            return user.username !== item.username
        }))
        setFilteredItems(filteredItems?.filter((user : User) => {
            return user.username !== item.username
        }))

        // Show a confirmation popup
        showAlert('Success', `Request was sent to ${item.username}!`);

        // Check if the device is unregistered
        if(unregistered.includes(item.push_token)){
            console.log(`Device with token ${item.push_token} is unregistered!`);
            return;
        }

        // Send a notification to the user using the Expo push notification tool
        await sendNotification({
            push_token : item.push_token,
            title : "New Friend Request",
            body : `User ${item.username} wants to be your friend!`,
            username : item.username,
            session : session,
            onUnregistered : (push_token : string) => {
                setUnregistered([...unregistered, push_token]);
            }
        })
    }

    const request = async (item : User) => {
        await makeRequest({
            username : item.username,        // Username from which the request came
            noRessources : () => {
                showAlert('Error', 'User not found');
                setApiItems(apiItems?.filter((user : User) => {
                    return user.username !== item.username
                }))
            },
            onEnd : () => {onSuccessfulRequest(item)},
            session : session
        })
    };

    // Filtering function for the search bar
    const handleChange = (searchItem : string) => {
        setSearchItem(searchItem);
        const filteredItems = apiItems?.filter((item : User) => 
            item.username.toLowerCase().includes((searchItem ?? '').toLowerCase())
        );
        if(filteredItems){
            setFilteredItems(filteredItems);
        }
    };


    return(
        <View className="flex-1 flex-col p-2 gap-8 bg-white">
            {/* Search bar */}
            <View className = "flex flex-row border border-border rounded-lg focus-within:color-dusty-rose items-center">
                <TextInput 
                    className = "flex-grow p-2"
                    placeholder = "Type a username"
                    value = {searchItem ?? ''}
                    cursorColor={colors['Graphite']}
                    onChangeText = {handleChange}
                    placeholderTextColor={colors['Graphite']}
                />
                <TouchableOpacity onPress={() => handleChange("")}>
                    <Ionicon 
                    name = "close-sharp" 
                    size = {24} 
                    color = {colors['Graphite']} 
                    className = "p-4"
                    />
                </TouchableOpacity>
            </View>

            {/* List of users*/}
            {loading ? (
            <View className='flex-1 h-12 justify-center items-center'>
                <LoadingDots
                    dots = {3}
                    colors = {[colors['Blush'], colors['Blush'], colors['Blush']]}
                    size = {10}
                    gap = {2}
                />
            </View>
            ) : filteredItems.length === 0 ? (
            <View className = "flex-1 p-4 justify-center items-center">
                <Text className = "font-bold text-dusty-rose text-2xl"> No users found </Text>
            </View>
            ) : (
            <FlatList 
                className = 'flex bg-white '
                ItemSeparatorComponent = {() => <View className = "h-4"/>}
                data = {filteredItems}
                renderItem = {({item}) => (<UserCard 
                    request = {'Request'} 
                    item = {item}
                    onPress = {() => request(item)}
                />)}
            />)}
        </View>
    )
}