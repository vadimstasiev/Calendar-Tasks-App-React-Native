import React, { useState } from 'react';
import auth from "@react-native-firebase/auth";

import {
    Text,
  ScrollView,
  View,
  SafeAreaView,
  Platform,
  TextInput
} from 'react-native';
import { RaisedTextButton } from 'react-native-material-buttons';



const LoginScreen =({navigation})=> {
 

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})


    const onSubmit = async () => {
        let tempErrors = {};

        if (email!=='' && password!==''){
            await auth().signInWithEmailAndPassword(email, password)
                .then(() => {
                    navigation.navigate('Home');
                })
                .catch((error) => {
                    if (error.code === 'auth/user-not-found') {
                        tempErrors['email'] = 'Email not found';
                    }
                    else if (error.code === 'auth/wrong-password') {
                        tempErrors['password'] = "Wrong Password";
                    }
                    else {
                        tempErrors['other'] = error.toString()
                    }
                }
            );
        }
        setErrors(tempErrors);
    }

    return (
        <SafeAreaView >
            <ScrollView
            keyboardShouldPersistTaps='handled'
            >
            <View>
                <TextInput
                style={{margin:10, borderColor:'black', borderWidth:1}}
                onChangeText={text=>setEmail(text)}
                placeholder='Email Address'
                error={errors.email}
                />
                {errors.email!==''?
                <Text style={{color:'red'}}>{errors.email}</Text>
                :<></>
                }
                <TextInput
                style={{margin:10, borderColor:'black', borderWidth:1}}
                onChangeText={text=>setPassword(text)}
                placeholder='Password Field'
                />
                {errors.password!==''?
                <Text style={{color:'red'}}>{errors.password}</Text>
                :<></>
                }
            </View>
            <View>
                <RaisedTextButton
                onPress={()=>onSubmit()}
                style={{margin:10, backgroundColor:'green', borderWidth:1}}
                titleColor={'white'}
                title="Submit"
                />
                {errors.other!==''?
                <Text style={{color:'red'}}>{errors.other}</Text>
                :<></>
                }
            </View>
            </ScrollView>
        </SafeAreaView>
        );
    }

export default LoginScreen;