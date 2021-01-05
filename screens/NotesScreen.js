import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, ScrollView, Alert } from "react-native";
import { Container, Header, Body, Text, Form, Textarea, Button, Item, Label, Input, Content, ListItem, CheckBox, Icon, Footer, FooterTab} from "native-base";
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

let db = firestore();


const ExpenseItem = (props) => {
   const [isEditing, setIsEditing] = useState('false');
   const [habit, setHabit] = useState(props.habit)
   const editClicked=()=>{
      setIsEditing(!isEditing);
      // console.log('update', props.habit.id, habit.name)
      props.editExpense(props.habit.id, habit.name);
   }
   return (
     <View style={styles.listTile}>
      {/* <Text style={styles.title}>{props.habit.name}</Text> */}
      {isEditing?
         <Icon
            name="delete"
            size={20}
            color="red"
            // onPress={() => props.deleteExpense(props.habit.id)}
            onPress={() => Alert.alert(
               "Delete",
               "Are you sure you want to delete?",
               [
                 {
                   text: "Cancel",
                   style: "cancel"
                 },
                 { text: "OK", onPress: () => props.deleteExpense(props.habit.id) }
               ],
               { cancelable: true }
             )}
         />
      :  
         <></>
      }
      <Card style={isEditing?{width: "72%"}:{width: "85%"}}>
         <CardItem>
            <Body>
            {isEditing?
               <Text >
               {props.habit.name}
               {'     '}
               </Text>
            :
            <>
               <TextInput
               defaultValue={String(props.habit.name)}
               autoFocus={true}
               onEndEditing={()=>{
                  editClicked()
               }}
               onChangeText={value => setHabit({...habit, name: value})}
               />
            </>
            }
            </Body>
         </CardItem>
      </Card>
      {isEditing?
      <TouchableOpacity
      style={styles.button}
      onPress={editClicked}
      >
        <Icon
            name={"edit"}
            size={20}
            color="#666666"
            // onPress={() => props.checkHabit(props.habit.id)}
            />
      </TouchableOpacity>
      :
      <TouchableOpacity
      style={styles.button}
      onPress={editClicked}
      >
        <Icon
            name={"check"}
            size={20}
            color="green"
            onEndEditing={()=>{
               editClicked()
            }}
            />
      </TouchableOpacity>}
      
     </View>
   );
 }

const DayScreen = ({route, navigation}) => {
   const { user, day, month, moods, defaultMood, colorOptions } = route.params;

   const [initializing, setInitializing] = useState(true)

   const [itemDescription, setItemDescription] = useState('')

   const [expenses, setExpenses] = useState([])

   const submit = (submitMood=mood) => {
      console.log(user.uid, month, day)
      db.collection("users").doc(user.uid).collection(month).doc(String(day)).set({
         message: input,
         mood: submitMood, 
         habitsChecked: habitsChecked
      })
      .catch((error) => {
         console.error("Error adding document: ", error);
      });
   }

   const deleteDay = () =>{
      db.collection("users").doc(user.uid).collection(month).doc(String(day)).update({
         message:firebase.firestore.FieldValue.delete(),
         mood: firebase.firestore.FieldValue.delete(), 
         habitsChecked: firebase.firestore.FieldValue.delete()
      })
      .catch((error) => {
         console.error("Error adding document: ", error);
      });
      navigation.goBack();

   }

   useEffect(() => {
      navigation.setOptions({ title: `${day}` })
      let unsubscribeDay = () => {};
      // setInitializing(true);
      // try {
      //    unsubscribeDay = db.collection("users").doc(user.uid).collection(month).doc(String(day)).onSnapshot( async querySnapshot=>{
      //       let data = await querySnapshot.data()
      //       if (data){
      //          setFirestoreInput(data.message);
      //          setInput(firestoreInput)
      //          setFirestoreMood(data.mood)
      //          console.log(mood)
      //          if(mood === defaultMood){
      //             setMood(data.mood);
      //          }
      //          setHabitsChecked(data.habitsChecked || [])
      //       }
      //       // await setInitializing(false);
      //    })
      // } catch (error) {
      //    console.log('Firestore error', error);
      // }

      let unsubscribeHabbits = () => {};
      // try {
      //    unsubscribeHabbits = db.collection("users").doc(user.uid).collection(month).doc('Habits').onSnapshot( async querySnapshot=>{
      //       let data = await querySnapshot.data();
      //       let firebaseHabits = [];
      //       if (data) {
      //          for (const id in data) {
      //             const name = data[id];
      //             firebaseHabits.push({id, name});
      //          }
      //       setSortHabbits(firebaseHabits);
      //       // setInitializing(false);
      //    }
      //    })
      // } catch (error) {
      //    console.log('Firestore error', error);
      //    // setInitializing(false);
      // }

      const navUnsubscribe = navigation.addListener('submitBeforeGoing', (e) => {
         submit();
      })
      setInitializing(false);
      return () => {
         unsubscribeDay();
         unsubscribeHabbits();
         navUnsubscribe();
      }
   }, []);
 

   if (initializing) return <View style={styles.loadingContainer}>
      <LoadingScreen backgroundColor={'white'} color={'#6aab6a'}/>
   </View>

   return (
      <View style={styles.container}>
      <View style={styles.habit}>
         <TextInput
            placeholder="Description"
            value={itemDescription}
            onChangeText={value => setItemDescription(value)}
            style={styles.textbox}
         />
         <Button title="Add" color="#4050b5" onPress={() => addHabit()} />
      </View>

      <ScrollView >
         {expenses.map(habit => (
            <ExpenseItem
            key={expense.id}
            habit={expense}
            editExpense={editExpense}
            deleteExpense={deleteExpense}
            />
         ))}
      </ScrollView>
      </View>
   );
   
}

const styles = StyleSheet.create({
   statusBar: {
      backgroundColor: "#4050b5",
      color: "#fff",
      width: "100%",
      height: 30
   },
   loadingContainer: {
      flex: 1,
      margin:0,
      justifyContent: 'center',
      paddingTop: 10,
      backgroundColor: 'white',
      padding: 8,
      height:700
   },
   container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "flex-start"
   },
   habit: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "center",
      alignItems: "center"
   },
   textbox: {
      borderWidth: 1,
      borderColor: "#4050b5",
      borderRadius: 8,
      padding: 10,
      margin: 10,
      width: "80%", 
      fontSize:16,
      height: 39
   },
   listTile: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: "white",
      paddingLeft: 10,
      paddingRight: 10,
      borderBottomColor: "#666666"
   },
   button: {
      alignItems: "center",
      backgroundColor: "white",
      padding: 10
    },
});

export default DayScreen;