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

const ItemList = ({ id, description, price, editExpense, deleteExpense }) => {
   const [isEditing, setIsEditing] = useState('false');
   const [expenseDescription, setExpenseMessage] = useState(description);
   const [expensePrice, setExpensePrice] = useState(price)


   const editClicked=()=>{
      setIsEditing(!isEditing);
      editExpense(id, expenseDescription, expensePrice);
   }
   return (
     <View style={styles.listTile}>
      
      <Card style={isEditing?{width: "62%"}:{width: "85%"}}>
         <CardItem>
            <Body>
            {isEditing?
            <>
               <Text>
               {expenseDescription}
               {'     '}
               </Text>
            </>
            :
            <>
               <Card style={{width:"100%"}}>
                  <CardItem >
                     <TextInput
                        style={{ border:0, margin:0, padding:0}} 
                        defaultValue={String(expensePrice)}
                        autoFocus={true}
                        // onEndEditing={()=>{
                        //    editClicked()
                        // }}
                        onChangeText={value => setExpensePrice(value)}
                     />
                  </CardItem>
               </Card>
               <Card style={{width:"100%"}}>
                  <CardItem>
                     <TextInput
                        style={{ border:0, margin:0, padding:0}} 
                        defaultValue={String(expenseDescription)}
                        autoFocus={true}
                        // onEndEditing={()=>{
                        //    editClicked()
                        // }}
                        onChangeText={value => setExpenseMessage(value)}
                     />
                  </CardItem>
               </Card>
               {/* <TextInput
               defaultValue={String(expenseDescription)}
               autoFocus={true}
               // onEndEditing={()=>{
               //    editClicked()
               // }}
               onChangeText={value => setExpenseMessage(value)}
               /> */}
               
            </>
            }
            </Body>
         </CardItem>
      </Card>
      {isEditing?
         <Card style={{width:"15%"}}>
            <CardItem>
               <Body>
                  <>
                     <Text>
                     {expensePrice}
                     {'     '}
                     </Text>
                  </>
               </Body>
            </CardItem>
         </Card>
         :<></>
      }
      {isEditing?
      <>
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
            { text: "OK", onPress: () => deleteExpense(id) }
         ],
         { cancelable: true }
         )}
      >
         <Icon
            name="delete"
            size={20}
         />
      </TouchableOpacity>
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
      </>
      :
      <TouchableOpacity
         style={styles.button}
         onPress={editClicked}
      >
         <Icon
            name={"save"}
            size={20}
            onEndEditing={()=>{
               editClicked()
            }}
         />
         <Text>Save</Text>
      </TouchableOpacity>
      }
      
     </View>
   );
 }


const DayScreen = ({route, navigation}) => {


   const { user, day, month, moods, defaultMood, colorOptions } = route.params;

   const [initializing, setInitializing] = useState(true)

   const [itemDescription, setItemDescription] = useState('')

   // Initalize empty array to store expenses
   const [expenses, setExpenses] = useState([])

  const [title, setTitle] = useState("");



  // function to add expense object in expense list
  const addExpense = async () => {
      if (title.length > 0) {
         // Add expense to the list
         let sendToFirestoreexpenses = {}
         let description=title;
         let price=2.96;
         // for (let expense in expenses){
         //    console.log('expense', expenses[expense])
         //    sendToFirestoreexpenses[expenses[expense].id]=expenses[expense].name;
         // }
         // await setExpenses([...expenses, { id: Date.now(), name: title}]);
         // clear the value of the textfield
         await db.collection("users").doc(user.uid).collection(month).doc('expenses').update({[Date.now()]:[description, price]})
         .catch((error) => {
            db.collection("users").doc(user.uid).collection(month).doc('expenses').set({[Date.now()]:[description, price]})
            .catch((error) => {
               console.error("Error adding expense: ", error);
            });
         });
         setTitle("");
      }
      let temp = {}
      for (let expense in expenses){
         console.log('expense', expenses[expense])
         temp[expenses[expense].id]=expenses[expense].name;
      }

  };

  const editExpense = (id, newDescription, newPrice) => {
      // setSortExpenses([...expenses.filter((expense)=>expense.id!==id), { id: id, name: title}]);
      // console.log(id, title)
      db.collection("users").doc(user.uid).collection(month).doc('expenses').update({[id]:[newDescription, newPrice]})
      .catch((error) => {
         console.error("Error editing expense: ", error);
      });
  }


  // function to delete expense from the expense list
  const deleteExpense = id => {
      // loop through expense list and return expenses that don't match the id
      // update the state using setExpenses function
      // setSortExpenses(expenses.filter(expense => {
      //    return expense.id !== id;
      // }));
      db.collection("users").doc(user.uid).collection(month).doc('expenses').update({[id]:firebase.firestore.FieldValue.delete()})
      .catch((error) => {
         console.error("Error deleting expense: ", error);
      });
  };

  const setSortExpenses = (inputList) => {
      setExpenses([...inputList.sort((a,b) => {
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
         unsubscribe = db.collection("users").doc(user.uid).collection(month).doc('expenses').onSnapshot( async querySnapshot=>{
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
            // expenses.map((expense) => {
            //    firebaseexpenses = firebaseexpenses.filter((firebaseexpense) => firebaseexpense.id!==expense.id)
            // })
            let localHabbits;
            firebaseexpenses.map((expense) => {
               localHabbits = expenses.filter((firebaseexpense) => firebaseexpense.id!==expense.id)
            })
            console.log(firebaseexpenses)
            setSortExpenses([...expenses, ...firebaseexpenses]);
            // await setInitializing(false);
         }
         })
      } catch (error) {
         console.log('Firestore error', error);
      }

      setInitializing(false);

      const navUnsubscribe = navigation.addListener('onLeaving', (e) => {
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
      <View style={styles.expense}>
        <TextInput
          placeholder="Add an expense"
          value={title}
          onChangeText={value => setTitle(value)}
          style={styles.textbox}
        />
        <Button title="Add" color="#4050b5" onPress={() => addExpense()} />
      </View>

      <ScrollView >
        {expenses.map(expense => (
          <ItemList
            key={expense.id}
            id={expense.id}
            description={expense.description}
            price={expense.price}
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
   expense: {
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