import {View, Text, NativeSyntheticEvent, NativeScrollEvent} from 'react-native';
import React, { useEffect, useState, useCallback, useRef} from 'react';
import FeedCard from '@/src/components/feedCard';
import { Content } from '@/src/types/feed';
import { FlashList } from "@shopify/flash-list";
import { loadFeed } from '@/src/apis/load';
import { useSession } from '@/src/context/ctx';
import LoadingDots from 'react-native-loading-dots';
import colors from '@/src/constants/colors';
import { likeSaveOutfit, makeComment } from '@/src/apis/edit';

enum Directions {
    Up = 'up',
    Down = 'down',
}

const MAX_DISTANCE = 5;

export default function Items() {
    const session = useSession();
    const [content, setContent] = useState<Content[]>([]);
    const [height, setHeight] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);
    const [direction, setDirection] = useState<Directions>(Directions.Down);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const prevIndexRef = useRef(-1);
    const [loading, setLoading] = useState<boolean>(false);
    const [noData, setNoData] = useState<boolean>(false);

    useEffect(() => {
        setNoData(false);
        const loadFeedFunction = async() => {
            setContent(await loadFeed({
                session : session,
                onEnd : () => {setLoading(false)},
                onNoData : () => {setNoData(true)}
            }));
        };

        setLoading(true);
        loadFeedFunction();
    }, [selectedIndex]);

    const handleMomentumScrollEnd = (e : NativeSyntheticEvent<NativeScrollEvent>) => {
        const indexNew = e.nativeEvent.contentOffset.y / height;
        if (indexNew == prevIndexRef.current) {return};
        setDirection(indexNew > prevIndexRef.current ? Directions.Down : Directions.Up);
        setSelectedIndex(indexNew);
        prevIndexRef.current = indexNew;
    }

    // useCallback hook is used to cache the result of a computationally expensive function
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
            {loading ? (
                <View className='flex-1 justify-center items-center'>
                    <LoadingDots
                        dots = {3}
                        colors = {[colors['Blush'], colors['Blush'], colors['Blush']]}
                        size = {10}
                        gap = {2}
                    />
                </View>
            ) : noData ? (
                <View className="flex-1 justify-center items-center bg-white">
                    <Text className="text-dusty-rose font-bold text-3xl">No items to load</Text>
                </View>
            ) : (
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
                    onMomentumScrollEnd={handleMomentumScrollEnd}        // Fires when we stop scrolling to change direction  
                />
            )}
        </View>
    );
}