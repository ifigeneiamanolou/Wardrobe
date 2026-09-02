import React from "react";
import {View, TouchableOpacity, FlatList, Text, Modal, TouchableWithoutFeedback} from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {useState, useCallback, useRef} from 'react';
import colors from "../constants/colors";

type props = {
    data : {value : string, label : string}[];                     // Dropdown menu values
    onChange: (value : string) => void;                            // Action prformed when a new item is selected   
    placeholder : string;                                          // Title of the dropdown
}

export default function ScrollDown({data, onChange, placeholder} : props){
    const [expanded, setExpanded] = useState<boolean>(false);
    const [value, setValue] = useState<string>("");
    const buttonRef = useRef<View>(null);
    const [top, setTop] = useState(0);

    const onSelect = useCallback((item : {value : string, label : string}) => {
        setValue(item.value);
        onChange(item.value);
        setExpanded(false);
    }, []);
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    return(
        <View 
            className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose"
            ref = {buttonRef}
            onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                const height = layout.height;
                const top = layout.y;
                const finalValue = top + height;
                setTop(finalValue);
            }}  
        >
            <TouchableOpacity onPress = {() => {setExpanded(!expanded)}} className="flex flex-row items-center"> 
                <Text className = "flex-grow"> {value || placeholder} </Text>
                <Ionicon name = "chevron-down" color = {colors['Graphite']} size = {24} />
            </TouchableOpacity>

            {expanded ? 
            <View className = "">
                <Modal transparent visible = {expanded}>
                    <View className="flex-1 justify-center align-middle p-20">
                        <View className = "absolute bg-white p-10 border-r-8" style = {{'top' : top}}>
                            <TouchableWithoutFeedback onPress = {toggleExpanded}>
                                <FlatList
                                    keyExtractor={(item) => item.value}
                                    data = {data}
                                    renderItem = {({item}) => (
                                        <TouchableOpacity onPress = {() => onSelect(item)}>
                                            <Text>{item.label}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ItemSeparatorComponent={() => (<View className=''/> )}
                                    className = "flex flex-col bg-white"
                                />
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </Modal>
            </View> : null}
        </View>
    );
};
