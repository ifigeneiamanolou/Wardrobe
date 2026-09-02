import React from "react";
import { View, Modal } from "react-native";

type Props = {
  visible: boolean;
  children: React.ReactNode;
};

const PopUp = ({ visible, children }: Props) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View className="flex-1 justify-center items-center bg-graphite/50">
        <View className="w-[90%] rounded-2xl bg-white p-5">
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default PopUp;