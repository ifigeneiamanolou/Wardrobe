import React, { useEffect } from "react";
import { View, Modal } from "react-native";
import Animated from "react-native-reanimated";
import { useSharedValue, withTiming, useAnimatedStyle, Easing, ReduceMotion } from "react-native-reanimated";
import { Dimensions } from "react-native";

type Props = {
  visible: boolean;             // Controls the popup
  children: React.ReactNode;
  modalVisible : boolean;       // Controls the background
};

const {width, height} = Dimensions.get("window");

const PopUp = ({ visible, children, modalVisible }: Props) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(width * 0.35);
  const translateY = useSharedValue(height * 0.35);
  const style = useAnimatedStyle(() => ({
    opacity : opacity.value,
    transform : [
      {translateX : translateX.value},
      {translateY : translateY.value},
      {scale : scale.value}
    ]
  }));

  useEffect(() => {
    if(!visible){
       opacity.value = withTiming(0, {
        duration : 1000,
        easing : Easing.in(Easing.cubic),
        reduceMotion : ReduceMotion.System
       });
       scale.value = withTiming(0, {
        duration : 1000,
        easing : Easing.in(Easing.cubic),
        reduceMotion : ReduceMotion.System
       });
       translateX.value = withTiming(width * 0.35, {
        duration : 1000,
        easing : Easing.in(Easing.cubic),
        reduceMotion : ReduceMotion.System
       });
       translateY.value = withTiming(height * 0.35, {
        duration : 1000,
        easing : Easing.in(Easing.cubic),
        reduceMotion : ReduceMotion.System
       });
    } else{
      opacity.value = withTiming(1, {
        duration : 1000,
        easing : Easing.out(Easing.cubic),
        reduceMotion : ReduceMotion.System
       });
       scale.value = withTiming(1, {
        duration : 1000,
        easing : Easing.out(Easing.cubic),
        reduceMotion : ReduceMotion.System
       });
       translateX.value = withTiming(0, {
        duration : 1000,
        easing : Easing.out(Easing.cubic),
        reduceMotion : ReduceMotion.System
       });
       translateY.value = withTiming(0, {
        duration : 1000,
        easing : Easing.out(Easing.cubic),
        reduceMotion : ReduceMotion.System
       });
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={modalVisible}
      onRequestClose={() => {}}
    >
      <View className="flex-1 justify-center items-center bg-graphite/50">
        <Animated.View className="w-[90%] rounded-2xl bg-white p-5" style = {style}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PopUp;