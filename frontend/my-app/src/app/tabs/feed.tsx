import {View, FlatList} from 'react-native';
import React, { useEffect, useState} from 'react';
import FeedCard from '@/src/components/feedCard';
import { Content } from '@/src/types/feed';

export default function Items() {
    const [content, setContent] = useState<Content[]>([]);

    useEffect(() => {

    }, []);

    return(
        <View className='flex-1'>
            <FlatList
                renderItem = {({item}) => (
                    <FeedCard item = {item}/>
                )}
                data = {content}
                disableIntervalMomentum = {true}
                scrollEnabled = {true}
                snapToAlignment='start'
                decelerationRate='fast'
                keyExtractor={(item) => item.url}
                className='flex flex-grow'
            />
        </View>
    );
}