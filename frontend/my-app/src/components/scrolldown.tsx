import React from "react";
import {View, TouchableOpacity, FlatList, Text, Modal, TouchableWithoutFeedback, Platform} from 'react-native';
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
    const [width, setWidth] = useState(0);
    const [left, setLeft] = useState(0);

    const onSelect = useCallback((item : {value : string, label : string}) => {
        setValue(item.value);
        onChange(item.value);
        setExpanded(false);
    }, []);

    const openMenu = () => {
        buttonRef.current?.measureInWindow((x, y, width, height) => {
            setTop(y + height);         // position the menu
            setWidth(width);
            setLeft(x);
            setExpanded(true);          // open the menu
        })
    };

    return(
        <View 
            className = "flex flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose" 
            ref = {buttonRef}
        >
            <TouchableOpacity onPress = {openMenu} className="flex flex-row items-center"> 
                <Text className = "flex-grow text-graphite ml-2"> {value || placeholder} </Text>
                <Ionicon name = "chevron-down" color = {colors['Graphite']} size = {24} />
            </TouchableOpacity>

            {expanded ? 
            <View className = "">
                <Modal transparent visible = {expanded}>
                    <View className="flex-1">
                        <View 
                            className = "absolute bg-white rounded-lg w-full p-4 border border-border" 
                            style = {{
                                'top' : top,
                                'left' : left,
                                'width' : width
                            }}>
                            <TouchableWithoutFeedback onPress = {() => setExpanded(false)}>
                                <FlatList
                                    keyExtractor={(item) => item.value}
                                    data = {data}
                                    renderItem = {({item}) => (
                                        <TouchableOpacity 
                                            onPress = {() => onSelect(item)}
                                            className="">
                                            <Text className = 'text-graphite'>{item.label}</Text>
                                        </TouchableOpacity>
                                    )}
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
