import React, {useState} from "react";
import { Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useSession } from "@/src/ctx";
import { useRouter } from "expo-router";
import Ionicon from 'react-native-vector-icons/Ionicons';
import colors from "@/src/constants/colors";
import * as ImagePicker from 'expo-image-picker';
import showAlert from "@/src/components/alert";
import * as yup from 'yup';
import { useFormik } from "formik";
import { changeProfilePicture, changeUserDetails } from "@/src/apis/edit";
import { File, Paths } from "expo-file-system";

const schema = yup.object().shape({
    name : yup.string().min(2, 'Too short!').max(50, 'Too long'),
    username : yup.string().min(2, 'Too short!').max(50, 'Too long'),
    email : yup.string().email('Invalid email'),
    password : yup.string()
        .min(8, 'Too short!')
        .max(20, 'Too long!')
        .matches(/[a-zA-Z]/, 'At least one character is required')
        .matches(/[0-9]/, 'At least one digit is required!')
})

export default function Edit(){
    const session = useSession();
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [image, setImage] = useState<string | undefined>(undefined);      // uri of image

    const formik = useFormik({
        validationSchema : schema,
        initialValues : {
            name : "",
            username : "",
            password : "",
            email : "",
        },
        onSubmit : async (values, {resetForm}) => {
            if(!image && !values.name && !values.username
                && !values.email && !values.password ){
                showAlert('Error', 'Change at least one detail to submit changes!');
                return;
            }

            if(image){
                await changeProfilePicture({
                    session : session,
                    image : image
                });
            };

            if(values.name || values.username || values.email || values.password){
                await changeUserDetails({
                    session : session,
                    name : values.name,
                    email : values.email,
                    password : values.password,
                    username : values.password
                });
            };
        }
    })

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes : ['images'],
            base64 : true,
            allowsEditing : true,        // allow cropping
            quality : 1                  // maximum quality
        })

        if(!result.canceled){
            const source = new File(result.assets[0].uri);
            const dest = new File(Paths.cache, `photo_${Date.now()}.jpg`);
            await source.copy(dest);
            setImage(dest.uri);
        }
    };

    return(
        <View className = "flex-1 flex-col p-4 gap-6 bg-white">
            {/* Photo profile button */}
            <View className = "items-center">
                <TouchableOpacity onPress = {pickImageAsync}>
                    {!image ?
                        <Ionicon name = "person-add" size = {150} color = {colors['Blush']} />
                        : <Image
                        className="rounded-full"
                        style={{ width: '60%', aspectRatio: 1 }}
                        source = {{uri : image}}
                        resizeMode="cover"
                        />
                    }
                </TouchableOpacity>
            </View>

            {/* Form fields */}
            <View className="flex flex-grow gap-4">
                <View className="flex-1 flex-col">
                    <View className="flex-1 flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                        <Ionicon name = "person" color = {colors['Graphite']} size = {24}/>
                        <TextInput 
                            value = {formik.values.name}
                            onChange={() => formik.handleChange('name')}
                            placeholder='Name'
                            className = "flex-grow text-graphite ml-2"
                        />
                    </View>
                    {formik.errors.name && formik.touched.name && 
                        <Text className="font-bold text-error text-sm">{formik.errors.name}</Text>
                    }
                </View>

                <View className="flex-1 flex-col">
                    <View className="flex-1 flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                        <Ionicon name = "at-outline" color = {colors['Graphite']} size = {24}/>
                        <TextInput 
                            value = {formik.values.username}
                            onChange={() => formik.handleChange('username')}
                            placeholder='Username'
                            className = "flex-grow text-graphite ml-2"
                        />
                    </View>
                    {formik.errors.username && formik.touched.username && 
                        <Text className="font-bold text-error text-sm">{formik.errors.username}</Text>
                    }
                </View>

                <View className="flex-1 flex-col">
                    <View className="flex-1 flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                        <Ionicon name = "mail-outline" color = {colors['Graphite']} size = {24}/>
                        <TextInput 
                            value = {formik.values.email}
                            onChange={() => formik.handleChange('email')}
                            placeholder='Email'
                            className = "flex-grow text-graphite ml-2"
                        />
                    </View>
                    {formik.errors.email && formik.touched.email && 
                        <Text className="font-bold text-error text-sm">{formik.errors.email}</Text>
                    }
                </View>

                <View className="flex-1 flex-col">
                    <View className="flex-1 flex-row items-center border border-border rounded-lg px-3 h-16 focus-within:color-dusty-rose">
                        <Ionicon name = "key" color = {colors['Graphite']} size = {24}/>
                        <TextInput 
                            value = {formik.values.password}
                            onChange={() => formik.handleChange('password')}
                            placeholder='Password'
                            className = "flex-grow text-graphite ml-2"
                            secureTextEntry = {!visible}
                        />
                        <Ionicon 
                            name = {visible ? "eye" : "eye-off"} 
                            color = {colors['Graphite']} 
                            size = {24}
                            onPress={() => setVisible(!visible)}
                        />
                    </View>
                    {formik.errors.password && formik.touched.password && 
                        <Text className="font-bold text-error text-sm">{formik.errors.password}</Text>
                    }
                </View>
            </View>

            {/* Submit button */}
            <View className = "flex flex-row justify-around items-center p-2">
                <TouchableOpacity 
                    className = "flex rounded-lg bg-blush p-4 justify-center items-center w-32"
                    onPress = {() => {router.navigate("/tabs/account")}}
                >
                    <Text className = "font-bold text-white text-xl">Back</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className = "flex rounded-lg bg-blush p-4 justify-center items-center w-32"
                    onPress = {() => formik.handleSubmit()}
                >
                    <Text className = "font-bold text-white text-xl">Submit</Text>
                </TouchableOpacity>
            </View>    
        </View>
    )
}