// Single image in the feed displaying an outfit

import { View, Image } from "react-native";
import React, {useState} from "react";
import { Content, Menu, ButtonMenu } from "../types/feed";
import DescriptionItem from "./descriptionItem";
import FeedIcons from "./feedIcons";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import LikeAnimation from "./likeAnimation";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type Props = {
    item : Content;
    isActive : boolean;     // Indicates whether this is the image the user is watching
    shouldPreload : boolean;    // Indicates whether the image should be loaded from AWS S3
    width : number;
    height : number;
};

const icons = ['heart-outline', 'chatbubble-sharp', 'arrow-down-sharp'];
const values = ['Like', 'Comment', 'Save'];

export default function FeedCard({item, isActive, shouldPreload, width, height} : Props){
    const {url, description, urlProfile, username} = item;
    const [liked, setLiked] = useState<boolean>(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState<boolean>(false);

    const handleLike = () => {
        setLiked(!liked);
        if(liked){
            setShowLikeAnimation(true);
        }
        iconsMenu.icons[0].icon = liked ? 'heart' : 'heart-outline';
        // change in db
    }

    const handleComment = () => {

    }

    const handleSave = () => {

    } 

    const onPress = [handleLike, handleComment, handleSave];
    const iconsMenu : Menu = {icons : icons.map((value, index) : ButtonMenu => {
        return(new ButtonMenu(values.at(index) ?? "", value, onPress.at(index) ?? (() => {})))
    })};

    const gesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            handleLike();
        });

    return(
        <View style = {{height : height, width : width}}>
            <GestureDetector gesture = {gesture}>
                {/* Outfit image */}
                <Image 
                    className="absolute top-0 left-0 right-0 bottom-0"
                    source = {isActive || shouldPreload ? {uri : url} : undefined}
                />

                {/* Description on the bottom of the screen */}
                <DescriptionItem 
                    url = {urlProfile} 
                    username={username} 
                    description={description}
                />

                {/* Icons on the right of the screen */}
                <FeedIcons icons = {iconsMenu.icons}/>

                {/* Like animation on double tap */}
                {showLikeAnimation && 
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <LikeAnimation
                            onComplete={() => setShowLikeAnimation(false)}
                        />
                    </Animated.View>
                }
            </GestureDetector>
        </View>
    )
}