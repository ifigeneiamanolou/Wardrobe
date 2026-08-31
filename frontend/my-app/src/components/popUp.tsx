
import { View, Modal } from 'react-native';
import React from 'react';
import { PropsWithChildren } from 'react';

type Props = {
    visible : boolean
    children : React.ReactNode
}

const popUp = ({visible, children} : Props) => {
    return(
        <Modal transparent visible = {visible}>
            <View className='flex-1 justify-center align-middle bg-white'>
                <View className = 'px-20 w-[80%] py-30 border border-r-8 elevation-md'>
                    {children}
                </View>
            </View>
        </Modal>
    );
};

export default popUp;