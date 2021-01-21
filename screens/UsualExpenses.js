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
import { Card, CardItem,  Body } from 'native-base';
import Icon from "react-native-vector-icons/AntDesign";
import LoadingScreen from "./LoadingScreen";
import { firebase } from "@react-native-firebase/auth";

let db = firestore();

// Item list component that is used for generating every individual list component
const ItemList = (props) => {
   const [isEditing, setIsEditing] = useState('false');
   const [usualExpense, setusualExpense] = useState(props.usualExpense)
   const editClicked=()=>{
      setIsEditing(!isEditing);
      props.editusualExpense(props.usualExpense.id, usualExpense.description);
   }
   return (
     <View style={styles.listTile}>
      <Card style={isEditing?{width: "72%"}:{width: "85%"}}>
         <CardItem>
            <Body>
            {isEditing?
               <Text >
               {props.usualExpense.description}
               {'     '}
               </Text>
            :
            <>
               <TextInput
               defaultValue={String(props.usualExpense.description)}
               autoFocus={true}
               onEndEditing={()=>{
                  editClicked()
               }}
               onChangeText={value => setusualExpense({...usualExpense, description: value})}
               />
            </>
            }
            </Body>
         </CardItem>
      </Card>
      {isEditing?
      <>
         <TouchableOpacity
         style={styles.button}
         onPress={editClicked}
         >
         <Icon
               name={"edit"}
               size={20}
               color="#666666"
               />
         </TouchableOpacity>
         <TouchableOpacity
            style={styles.button}
            onPress={() => Alert.alert(
               "Delete",
               "Are you sure you want to delete?",
               [
               {
                  text: "Cancel",
                  style: "cancel"
               },
               { text: "OK", onPress: () => props.deleteusualExpense(props.usualExpense.id) }
               ],
               { cancelable: true }
            )}
         >
            <Icon
               name="delete"
               size={20}
               color="red"
            />
         </TouchableOpacity>
      </>
      :
      <TouchableOpacity
      style={styles.button}
      onPress={editClicked}
      >
        <Icon
            description={"edit"}
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

const usualExpensesScreen = ({navigation, user}) => {
   navigation.setOptions({ title: `Usual Expenses` });
   
   const month = String(new Date().getMonth() + 1);
   
   // Initalize empty array to store usualExpenses
   const [usualExpenses, setUsualExpenses] = useState([]);
   const [title, setTitle] = useState("");   
   const [initializing, setInitializing] = useState(true)

   // function to add usualExpense object in usualExpense list
   const addusualExpense = async () => {
         if (title.length > 0) {
            // Add usualExpense to the list
            let sendToFirestoreusualExpenses = {}
            let usualExpenseMessage=title;
            await db.collection("users").doc(user.uid).collection(month).doc('usualExpenses').update({[Date.now()]:usualExpenseMessage})
            .catch((error) => {
               db.collection("users").doc(user.uid).collection(month).doc('usualExpenses').set({[Date.now()]:usualExpenseMessage})
               .catch((error) => {
                  console.error("Error adding document: ", error);
               });
            });
            setTitle("");
         }
         let temp = {}
         for (let usualExpense in usualExpenses){
            temp[usualExpenses[usualExpense].id]=usualExpenses[usualExpense].description;
         }

   };

   const editusualExpense = (id, expenseUpdate) => {
         db.collection("users").doc(user.uid).collection(month).doc('usualExpenses').update({[id]:expenseUpdate})
         .catch((error) => {
            console.error("Error adding document: ", error);
         });
   }


   // function to delete usualExpense from the usualExpense list
   const deleteusualExpense = id => {
         db.collection("users").doc(user.uid).collection(month).doc('usualExpenses').update({[id]:firebase.firestore.FieldValue.delete()})
         .catch((error) => {
            console.error("Error adding document: ", error);
         });
   };

   // function to sort the expenses list which ensures that the UI does not glitch when an item from the list is clicked
   const setSortExpenses = (inputExpenses) => {
         setUsualExpenses([...inputExpenses.sort((a,b) => {
            var x = a.id.toLowerCase();
            var y = b.id.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
         })])
   }

   // initialize subscriptions to the firestore
   useEffect(() => {
         // preinitialize the unsubscribe in case the try statement fails
         let unsubscribe = () => {};
         setInitializing(true);
         try {
            unsubscribe = db.collection("users").doc(user.uid).collection(month).doc('usualExpenses').onSnapshot( async querySnapshot=>{
               let data = await querySnapshot.data()
               let firebaseusualExpenses = []
               if (data) {
                  for (const id in data) {
                     const description = data[id];
                     firebaseusualExpenses.push({id, description})
                  }
               let localExpenses;
               firebaseusualExpenses.map((usualExpense) => {
                  localExpenses = usualExpenses.filter((firebaseusualExpense) => firebaseusualExpense.id!==usualExpense.id)
               })
               setSortExpenses([...usualExpenses, ...firebaseusualExpenses]);
            }
            })
         } catch (error) {
            console.log('Firestore error', error);
         }

         setInitializing(false);

         const navUnsubscribe = navigation.addListener('onLeave', (e) => {
            submit();
         })
         return () => {
            unsubscribe();
            navUnsubscribe();
         }
   }, []);

   // show a loading screen if the current screen is not yet ready to display its data
   if (initializing) return <View style={styles.loadingContainer}>
      <LoadingScreen backgroundColor={'white'} color={'grey'}/>
   </View>

   return (
      <View style={styles.container}>
         <View style={styles.usualExpense}>
         <TextInput
            placeholder="Add a frequent expense"
            value={title}
            onChangeText={value => setTitle(value)}
            style={styles.textbox}
         />
         <Button title="Add" color="green" onPress={() => addusualExpense()} />
         </View>
         <Text style={{marginRight:10, marginLeft:12}}>Note: This will add the expense to the expense suggestions bar.</Text>
         <ScrollView >
         {usualExpenses.map(usualExpense => (
            <ItemList
               key={usualExpense.id}
               usualExpense={usualExpense}
               editusualExpense={editusualExpense}
               deleteusualExpense={deleteusualExpense}
            />
         ))}
         </ScrollView>
      </View>
   );
}

// styles for the current screen
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
   usualExpense: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "center",
      alignItems: "center"
   },
   textbox: {
      borderWidth: 1,
      borderColor: "green",
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

export default usualExpensesScreen;