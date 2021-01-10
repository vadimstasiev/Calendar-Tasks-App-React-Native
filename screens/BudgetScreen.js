import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Alert } from "react-native";
import { Container, Header, Body, Text, Form, Textarea, Button, Item, Label, Input, Card, CardItem, Content, ListItem, CheckBox, Icon, Footer, FooterTab} from "native-base";
import ColorPalette from 'react-native-color-palette';

import auth, { firebase } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
// import { NavigationActions, StackActions } from 'react-navigation';
import LoadingScreen from "./LoadingScreen";


import Svg, {
  Circle,
  Ellipse,
  G,
  TSpan,
  TextPath,
  Path,
  Text as SvgText,
  Polygon,
  Polyline,
  Line,
  Rect,
  Use,
  Image,
  Symbol,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  ClipPath,
  Pattern,
  Mask,
} from "react-native-svg";
import { sub } from "react-native-reanimated";
import { Colors } from "react-native/Libraries/NewAppScreen";

import { FakeCurrencyInput } from 'react-native-currency-input';


let db = firestore();


const ColorBudgetSelector = ({}) => {
   // const [isChecked, setIsChecked] = useState(false);
   const defaultBudget = 2323; // change later
   const [budget, setBudget] = useState(defaultBudget);
   const [color, setColor] = useState('#C0392B');
   const [isEditing, setIsEditing] = useState(false);
   return <ListItem>
      <Card>
         <CardItem >
            {isEditing?
               <Form>
                  <Card style={{width:"100%"}}>
                        <FakeCurrencyInput
                           // autoFocus={true}
                           // style={{fontSize:20, width:'100%'}} 
                           value={budget}
                           onChangeValue={value => setBudget(value)}
                           unit="£"
                           delimiter=","
                           separator="."
                           precision={2}
                           // editable={false}
                           // onChangeText={(formattedValue) => {
                           //    console.log(formattedValue); // $2,310.46
                           // }}
                           style={{
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: 18,
                              marginTop: 0,
                              paddingBottom:8,
                              width: "100%",
                           }}
                        />
                  </Card>
                  {/* <Text style={{
                     textAlign: 'center',
                     fontWeight: 'bold',
                     fontSize: 18,
                     marginTop: 0,
                     width: "100%",
                  }}>{color}</Text> */}
                  <ColorPalette
                        onChange={ color => {
                           setColor(color);
                           // submit(color);
                        }}
                        value={color}
                        // colors={colorOptions}
                        titleStyles={{display:"none"}}
                        colors= {[
                           '#C0392B', '#E74C3C', '#9B59B6', '#8E44AD', '#2980B9', '#3498DB', '#1ABC9C',
                           '#16A085', '#27AE60', '#2ECC71', '#F1C40F', '#F39C12', '#E67E22', '#D35400',
                           '#FFFFFF', '#BDC3C7', '#95A5A6', '#7F8C8D',
                         ]}
                     />
               </Form>
               :
               <Form style={{width:"100%"}}>
                  <Card style={{width:"80%"}}>
                        <FakeCurrencyInput
                           // autoFocus={true}
                           // style={{fontSize:20, width:'100%'}} 
                           value={budget}
                           onChangeValue={value => setBudget(value)}
                           unit="£"
                           delimiter=","
                           separator="."
                           precision={2}
                           // editable={false}
                           // onChangeText={(formattedValue) => {
                           //    console.log(formattedValue); // $2,310.46
                           // }}
                           style={{
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: 18,
                              marginTop: 0,
                              paddingBottom:8,
                              width: "100%",
                           }}
                        />
                  </Card>
                  {/* <Text style={{
                     textAlign: 'center',
                     fontWeight: 'bold',
                     fontSize: 18,
                     marginTop: 0,
                     width: "100%",
                  }}>{color}</Text> */}
                  <ColorPalette
                        style={{width:"10%"}}
                        onChange={ color => {
                           setColor(color);
                           // submit(color);
                        }}
                        value={color}
                        // colors={colorOptions}
                        titleStyles={{display:"none"}}
                        colors= {[color]}
                     />
               </Form>
            }
         </CardItem>
      </Card>
   </ListItem>
}

const Notes = ({user, navigation}) => {

   const [initializing, setInitializing] = useState(true)

   
   const [cost, setCost] = useState(''); // will change to price cost
   const [firestoreInput, setFirestoreInput] = useState();

   const [color, setColor] = useState('#C0392B');
   
   // const [color, setColor] = useState(defaultMood);
   const [firestoreMood, setFirestoreMood] = useState();

   const [habits, setHabits] = useState([]);
   const [habitsChecked, setHabitsChecked] = useState([]);
   
   const setSortHabbits = (inputHabbits) => {
      // var temp = habits.slice(0);
      setHabits([...inputHabbits.sort((a,b) => {
         var x = a.id.toLowerCase();
         var y = b.id.toLowerCase();
         return x < y ? -1 : x > y ? 1 : 0;
      })])
  }

   const habitToggleChecked = (id, checked) => {
      if(checked){
         temp = habitsChecked;
         for (let i = temp.length - 1; i >= 0; i--) {
            if (temp[i] === id) {
               temp.splice(i, 1);
            }
         }
         setHabitsChecked(temp);
      } else {
         if(!habitsChecked.includes(id)){
            habitsChecked.push(id);
         }
      }
      submit();
   }

   const submit = (submitColor=color) => {
      console.log(user.uid, "budget")
      db.collection("users").doc(user.uid).collection("budget").doc(String(cost)).set({
         color: submitColor, 
      })
      .catch((error) => {
         console.error("Error adding document: ", error);
      });
   }

   const deleteColor = (color) =>{
      db.collection("users").doc(user.uid).collection("budget").doc(String(cost)).delete()
      .catch((error) => {
         console.error("Error adding document: ", error);
      });
      navigation.goBack();
   }

   useEffect(() => {
      navigation.setOptions({ title: `Budget` })
      let unsubscribeDay = () => {};
      setInitializing(true);
      try {
         unsubscribeDay = db.collection("users").doc(user.uid).collection("budget").doc(String(cost)).onSnapshot( async querySnapshot=>{
            let data = await querySnapshot.data()
            if (data){
               setFirestoreInput(data.message);
               setCost(firestoreInput)
               setFirestoreMood(data.color)
               console.log(color)
               if(color === defaultMood){
                  setColor(data.color);
               }
               setHabitsChecked(data.habitsChecked || [])
            }
            // await setInitializing(false);
         })
      } catch (error) {
         console.log('Firestore error', error);
      }

      let unsubscribeHabbits = () => {};
      try {
         unsubscribeHabbits = db.collection("users").doc(user.uid).collection("budget").doc(String(cost)).onSnapshot( async querySnapshot=>{
            let data = await querySnapshot.data();
            let firebaseHabits = [];
            if (data) {
               for (const id in data) {
                  const name = data[id];
                  firebaseHabits.push({id, name});
               }
            setSortHabbits(firebaseHabits);
            // setInitializing(false);
         }
         })
      } catch (error) {
         console.log('Firestore error', error);
         // setInitializing(false);
      }

      const navUnsubscribe = navigation.addListener('submitBeforeGoing', (e) => {
         submit();
      })
      setInitializing(false);
      return () => {
         unsubscribeDay();
         unsubscribeHabbits();
         navUnsubscribe();
      }
   }, [firestoreInput, firestoreMood]);
 

   if (initializing) return <View style={styles.loadingContainer}>
      <LoadingScreen backgroundColor={'white'} color={'#6aab6a'}/>
   </View>

   return <Container>
         <Header style={{backgroundColor:'#2E8B57'}}>
            <Text style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: 16,
                  marginTop: 15,
                  // width: 200,
                  color: 'white',
               }}>Set the Cost Colors for the Calendar</Text>
        </Header>
      <Content padder>
         <ColorBudgetSelector/>
         
      </Content>
   </Container>
}

const styles = StyleSheet.create({
   loadingContainer: {
      flex: 1,
      margin:0,
      justifyContent: 'center',
      paddingTop: 10,
      backgroundColor: 'white',
      padding: 8,
      height:700
   },
 })

export default Notes;