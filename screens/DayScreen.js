import React, { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import { Container, Header, Content, Card, CardItem,  Body, } from 'native-base';
import Icon from "react-native-vector-icons/MaterialIcons";
import LoadingScreen from "./LoadingScreen";

import { firebase } from "@react-native-firebase/auth";


let db = firestore();

const TodoList = (props) => {
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


const DayScreen = ({navigation, user, monthSvgScreen}) => {


   const { user, day, month, moods, defaultMood, colorOptions } = route.params;

   const [initializing, setInitializing] = useState(true)

   const [itemDescription, setItemDescription] = useState('')

   // Initalize empty array to store expenses
   const [expenses, setExpenses] = useState([])

  const [title, setTitle] = useState("");



  // function to add habit object in habit list
  const addExpense = async () => {
      if (title.length > 0) {
         // Add habit to the list
         let sendToFirestoreexpenses = {}
         let habitMessage=title;
         // for (let habit in expenses){
         //    console.log('habit', expenses[habit])
         //    sendToFirestoreexpenses[expenses[habit].id]=expenses[habit].name;
         // }
         // await setExpenses([...expenses, { id: Date.now(), name: title}]);
         // clear the value of the textfield
         await db.collection("users").doc(user.uid).collection(monthSvgScreen).doc('expenses').update({[Date.now()]:habitMessage})
         .catch((error) => {
            db.collection("users").doc(user.uid).collection(monthSvgScreen).doc('expenses').set({[Date.now()]:habitMessage})
            .catch((error) => {
               console.error("Error adding document: ", error);
            });
         });
         setTitle("");
      }
      let temp = {}
      for (let habit in expenses){
         console.log('habit', expenses[habit])
         temp[expenses[habit].id]=expenses[habit].name;
      }

  };

  const editExpense = (id, habbitUpdate) => {
      // setSortHabbits([...expenses.filter((habit)=>habit.id!==id), { id: id, name: title}]);
      // console.log(id, title)
      db.collection("users").doc(user.uid).collection(monthSvgScreen).doc('expenses').update({[id]:habbitUpdate})
      .catch((error) => {
         console.error("Error adding document: ", error);
      });
  }


  // function to delete habit from the habit list
  const deleteExpense = id => {
      // loop through habit list and return expenses that don't match the id
      // update the state using setExpenses function
      // setSortHabbits(expenses.filter(habit => {
      //    return habit.id !== id;
      // }));
      db.collection("users").doc(user.uid).collection(monthSvgScreen).doc('expenses').update({[id]:firebase.firestore.FieldValue.delete()})
      .catch((error) => {
         console.error("Error adding document: ", error);
      });
  };

  const setSortHabbits = (inputHabbits) => {
      // var temp = expenses.slice(0);
      setExpenses([...inputHabbits.sort((a,b) => {
         var x = a.id.toLowerCase();
         var y = b.id.toLowerCase();
         return x < y ? -1 : x > y ? 1 : 0;
      })])
  }

  useEffect(() => {
      navigation.setOptions({ title: `${day}` })
      let unsubscribe = () => {};
      setInitializing(true);
      try {
         unsubscribe = db.collection("users").doc(user.uid).collection(monthSvgScreen).doc('expenses').onSnapshot( async querySnapshot=>{
            // await setInitializing(true);
            let data = await querySnapshot.data()
            let firebaseexpenses = []
             console.log('data', data)
            if (data) {
               for (const id in data) {
                  const name = data[id];
                  // console.log('here', id, name)
                  firebaseexpenses.push({id, name})
               }
            // expenses.map((habit) => {
            //    firebaseexpenses = firebaseexpenses.filter((firebaseHabit) => firebaseHabit.id!==habit.id)
            // })
            let localHabbits;
            firebaseexpenses.map((habit) => {
               localHabbits = expenses.filter((firebaseHabit) => firebaseHabit.id!==habit.id)
            })
            console.log(firebaseexpenses)
            setSortHabbits([...expenses, ...firebaseexpenses]);
            // await setInitializing(false);
         }
         })
      } catch (error) {
         console.log('Firestore error', error);
      }

      setInitializing(false);

      const navUnsubscribe = navigation.addListener('submitBeforeGoing', (e) => {
         submit();
      })
      return () => {
         unsubscribe();
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
          placeholder="Add a Habit"
          value={title}
          onChangeText={value => setTitle(value)}
          style={styles.textbox}
        />
        <Button title="Add" color="#4050b5" onPress={() => addExpense()} />
      </View>

      <ScrollView >
        {expenses.map(habit => (
          <TodoList
            key={habit.id}
            habit={habit}
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