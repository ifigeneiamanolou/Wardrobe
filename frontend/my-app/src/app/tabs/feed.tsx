import {View, Text} from 'react-native';
import React, { useEffect, useState, useCallback} from 'react';
import FeedCard from '@/src/components/feedCard';
import { Content } from '@/src/types/feed';
import { FlashList } from "@shopify/flash-list";

enum Directions {
    'up',
    'down'
}

const MAX_DISTANCE = 5;

export default function Items() {
    const [content, setContent] = useState<Content[]>([]);
    const [height, setHeight] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);
    const [direction, setDirection] = useState<Directions>(Directions.down);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    useEffect(() => {
        // load the content interactively
        // change the items every time the index changes
    }, [selectedIndex]);

    const renderItem = useCallback(({item, index}: {item: Content; index: number}) => {
        // Check if it's the current item
        const isActive = selectedIndex === index;  
        
        // Check if the image should be loaded from the AWS S3 url
        const distanceFromActive = index - selectedIndex;
        const isAhead = direction.toString() === 'down' 
            ? distanceFromActive > 0 
            : distanceFromActive < 0;
        const shouldPreloadAhead = isAhead && Math.abs(distanceFromActive) <= MAX_DISTANCE;
        const shouldPreloadBehind = !isAhead && Math.abs(distanceFromActive) === 1;
        const shouldPreload = shouldPreloadAhead || shouldPreloadBehind;

        return(
            <FeedCard
                item = {item}
                isActive = {isActive}
                shouldPreload = {shouldPreload}
                width={width}
                height={height}
            />
        );
    }, [direction, selectedIndex]);

    return(
        <View className='flex-1' onLayout={(e) => {
            setHeight(e.nativeEvent.layout.height);
            setWidth(e.nativeEvent.layout.width);
        }}>
            <FlashList
                renderItem = {renderItem}
                data = {content}
                disableIntervalMomentum = {true}
                scrollEnabled = {true}
                snapToAlignment='start'
                decelerationRate='fast'
                pagingEnabled                       // Snaps to full screens
                getItemType={() => "video"}         // Single recycling pool
                drawDistance={height * 3}           // How far ahead to render off screen (in pixels)
                keyExtractor={(item) => item.url}   // Improved performance 
                ListEmptyComponent={() => {
                    <View className='flex-1 justify-center items-center bg-white'>
                        <Text className='text-dusty-rose font-bold text-3xl'> No items to load </Text>
                    </View>
                }}
                showsVerticalScrollIndicator = {false}      // Hide the scrollbar
                overrideItemLayout={(layout, _item, index) => ({
                    length: height,
                    offset: height * index,
                    index,
                })}
                snapToInterval={height}                     // Exact screen alignment
            />
        </View>
    );
}