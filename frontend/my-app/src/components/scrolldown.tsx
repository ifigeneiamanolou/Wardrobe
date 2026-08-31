import React from "react";
import {View, TouchableOpacity, FlatList, Text, Modal, TouchableWithoutFeedback} from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {useState, useCallback} from 'react';
import colors from "../constants/colors";

type props = {
    data : {value : string, label : string}[];                     // Dropdown menu values
    onChange: (value : string) => void;   // Action prformed when a new item is selected   
    placeholder : string;                                          // Title of the dropdown
}

export default function ScrollDown({data, onChange, placeholder} : props){
    const [expanded, setExpanded] = useState<boolean>(false);
    const [value, setValue] = useState<string>("");
    const onSelect = useCallback((item : {value : string, label : string}) => {
        setValue(item.value);
        onChange(item.value);
        setExpanded(false);
    }, []);
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    return(
        <View>
            <TouchableOpacity onPress = {() => {setExpanded(!expanded)}}>
                <Text> {value || placeholder} </Text>
                <Ionicon name = "chevron-down" color = {colors['Graphite']} size = {24} />
            </TouchableOpacity>

            {expanded ? 
            <View>
                <Modal transparent visible = {expanded}>
                    <TouchableWithoutFeedback onPress = {toggleExpanded}>
                        <FlatList
                            keyExtractor={(item) => item.value}
                            data = {data}
                            renderItem = {({item}) => (
                                <TouchableOpacity onPress = {() => onSelect(item)}>
                                    <Text>item</Text>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => (<View className=''/> )}
                        />
                    </TouchableWithoutFeedback>
                </Modal>
            </View> : null}
        </View>
    );
};
