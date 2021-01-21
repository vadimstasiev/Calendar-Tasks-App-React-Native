import React, { useState } from 'react';
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import {
  Text,
  ScrollView,
  View,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { RaisedTextButton } from 'react-native-material-buttons';

let db = firestore();


const RegisterScreen =({navigation})=> {
 

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState({})


    const onSubmit = async () => {
      let tempErrors = {};

      if (email!=='' && password!=='' && confirmPassword===password) {
          await auth()
          .createUserWithEmailAndPassword(email, password)
          .then(async() => {
            let currentUser = auth().currentUser;
            await db.collection("users").doc(currentUser.uid).set({
              displayName: username,
              email: currentUser.email
            })
            navigation.navigate('Home');
          })
          .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
              tempErrors['email'] = 'Email already in use';
            }
            else if (error.code === 'auth/invalid-email') {
              tempErrors['email'] = "Invalid format";
            }
            else {
              tempErrors['other'] = error.toString()
            }
          });
      } else if (confirmPassword!==password) {
        tempErrors['confirmPassword'] = "Passwords do not match!";
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
                onChangeText={text=>setUsername(text)}
                placeholder='username'
                />
                <Text></Text>
                <TextInput
                style={{margin:10, borderColor:'black', borderWidth:1}}
                onChangeText={text=>setEmail(text)}
                placeholder='Email Address'
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
                <TextInput
                style={{margin:10, borderColor:'black', borderWidth:1}}
                onChangeText={text=>setConfirmPassword(text)}
                placeholder='Confirm Password Field'
                />
                {errors.password!==''?
                <Text style={{color:'red'}}>{errors.confirmPassword}</Text>
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

export default RegisterScreen;