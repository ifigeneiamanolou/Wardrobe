// Single image in the feed displaying an outfit

import { View, Image } from "react-native";
import React from "react";
import { Content, Menu, ButtonMenu } from "../types/feed";
import DescriptionItem from "./descriptionItem";
import FeedIcons from "./feedIcons";

type Props = {
    item : Content
};

const handleLike = () => {

}

const handleComment = () => {

}

const handleSave = () => {

}

const icons = ['heart', 'chatbubble-sharp', 'arrow-down-sharp'];
const values = ['Like', 'Comment', 'Save'];
const onPress = [handleLike, handleComment, handleSave];

const iconsMenu : Menu = {icons : icons.map((value, index) : ButtonMenu => {
    return(new ButtonMenu(values.at(index) ?? "", value, onPress.at(index) ?? (() => {})))
})}

export default function FeedCard({item} : Props){
    const {url, description, urlProfile, username} = item;

    return(
        <View className="flex-1">
            <Image 
                className="flex-1"
                source = {{uri : `data:image/png;base64,${url}`}}
            />
            <DescriptionItem 
                url = {urlProfile} 
                username={username} 
                description={description}
            />
            <FeedIcons icons = {iconsMenu.icons}/>
        </View>
    )
}