import React, { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button as RButton,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import { Container, Header, Content, Card, CardItem, Button, Body, Right, Footer, FooterTab } from 'native-base';
import Icon from "react-native-vector-icons/AntDesign";
import LoadingScreen from "./LoadingScreen";
import Spinner from 'react-native-spinkit';

import CurrencyInput from 'react-native-currency-input';
import { FakeCurrencyInput } from 'react-native-currency-input';

import { firebase } from "@react-native-firebase/auth";
import { isLoaded } from "expo-font";


let db = firestore();

const ItemList = ({ id, description, price, editExpense, deleteExpense }) => {
   const [isEditing, setIsEditing] = useState('false');
   const [expenseDescription, setExpenseDescription] = useState(description);
   const [expensePrice, setExpensePrice] = useState(price)
   const [isSaving, setIsSaving] = useState(false)


   const editClicked=()=>{
      setIsSaving(true);
      editExpense(id, expenseDescription, expensePrice)
      .then(()=>{
         setIsEditing(!isEditing);
         setIsSaving(false);   
      })
      .catch((error) => {
         console.error("Error editing expense: ", error);
         setIsSaving(false);
      });
   }
   return (
     <View style={styles.listTile}>
      
      <Card style={isEditing?{width: "50%"}:{width: "85%"}}>
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
               <Text style={{}}>Description:</Text>
               <Card style={{width:"100%"}}>
                  <CardItem >
                     <TextInput
                        style={{ width:"100%", margin:0, padding:0}} 
                        defaultValue={String(expenseDescription)}
                        // autoFocus={true}
                        // onEndEditing={()=>{
                        //    editClicked()
                        // }}
                        onChangeText={value => setExpenseDescription(value)}
                     />
                  </CardItem>
               </Card>
               <Text style={{}}>Cost:</Text>
               <Card style={{width:"100%"}}>
                  <CardItem>
                     {/* <TextInput
                        style={{ width:"100%", margin:0, padding:0}} 
                        defaultValue={String(expensePrice)}
                        autoFocus={true}
                        // onEndEditing={()=>{
                        //    editClicked()
                        // }}
                        onChangeText={value => setExpensePrice(value)}
                     /> */}
                     <FakeCurrencyInput
                        autoFocus={true}
                        style={{ width:"100%", margin:0, padding:0}} 
                        value={expensePrice}
                        onChangeValue={value => setExpensePrice(value)}
                        unit="£"
                        delimiter=","
                        separator="."
                        precision={2}
                        // editable={false}
                        // onChangeText={(formattedValue) => {
                        //    console.log(formattedValue); // $2,310.46
                        // }}
                        // style={styles.textboxPrice}
                     />
                  </CardItem>
               </Card>
               {/* <TextInput
               defaultValue={String(expenseDescription)}
               autoFocus={true}
               // onEndEditing={()=>{
               //    editClicked()
               // }}
               onChangeText={value => setExpenseDescription(value)}
               /> */}
               
            </>
            }
            </Body>
         </CardItem>
      </Card>
      {isEditing?
         <Card style={{width:"25%"}}>
            <CardItem>
               <Body>
                  <>
                     {/* <Text>
                     {expensePrice}
                     {'     '}
                     </Text> */}
                     <FakeCurrencyInput
                        // autoFocus={true}
                        style={{ width:"100%", margin:0, padding:0, fontSize:12}} 
                        value={expensePrice}
                        onChangeValue={value => setExpensePrice(value)}
                        unit="£"
                        delimiter=","
                        separator="."
                        precision={2}
                        editable={false}
                        // onChangeText={(formattedValue) => {
                        //    console.log(formattedValue); // $2,310.46
                        // }}
                        // style={styles.textboxPrice}
                     />
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
         {isSaving?
            <Spinner isVisible={true} size={20} type={'Circle'}/>
         :
            <Icon
            name={"save"}
            size={20}
            onEndEditing={()=>{
               editClicked()
            }}
            />
         }
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

   const [titleDescription, setTitleDescription] = useState("");

   const [titlePrice, setTitlePrice] = useState("")

   const [totalCost, setTotalCost] = useState(0)

  // function to add expense object in expense list
  const addExpense = async () => {
     console.log(titlePrice.length)
      if (titleDescription.length > 0 && String(titlePrice).length > 0) {
         // Add expense to the list
         let sendToFirestoreexpenses = {}
         let description=titleDescription;
         let price=titlePrice;
         // for (let expense in expenses){
         //    console.log('expense', expenses[expense])
         //    sendToFirestoreexpenses[expenses[expense].id]=expenses[expense].name;
         // }
         // await setExpenses([...expenses, { id: Date.now(), name: titleDescription}]);
         // clear the value of the textfield
         await db.collection("users").doc(user.uid).collection(month).doc(day).update({[Date.now()]:[description, price]})
         .catch((error) => {
            db.collection("users").doc(user.uid).collection(month).doc(day).set({[Date.now()]:[description, price]})
            .catch((error) => {
               console.error("Error adding expense: ", error);
            });
         });
         setTitleDescription("");
         setTitlePrice("");
      }
      // let temp = {}
      // for (let expense in expenses){
      //    console.log('expense', expenses[expense])
      //    temp[expenses[expense].id]=expenses[expense].name;
      // }

  };

  const editExpense = (id, newDescription, newPrice) => {
      // setSortExpenses([...expenses.filter((expense)=>expense.id!==id), { id: id, name: titleDescription}]);
      // console.log(id, titleDescription)
      return db.collection("users").doc(user.uid).collection(month).doc(day).update({[id]:[newDescription, newPrice]})
  }


  // function to delete expense from the expense list
  const deleteExpense = id => {
      // loop through expense list and return expenses that don't match the id
      // update the state using setExpenses function
      // setSortExpenses(expenses.filter(expense => {
      //    return expense.id !== id;
      // }));
      db.collection("users").doc(user.uid).collection(month).doc(day).update({[id]:firebase.firestore.FieldValue.delete()})
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
         unsubscribe = db.collection("users").doc(user.uid).collection(month).doc(day).onSnapshot( async querySnapshot=>{
            // await setInitializing(true);
            let data = await querySnapshot.data()
            let firebaseExpenses = []
             console.log('data', data)
            if (data) {
               for (const id in data) {
                  const expense = data[id];
                  // console.log('here', id, name)
                  firebaseExpenses.push({id, expense})
               }
            // expenses.map((expense) => {
            //    firebaseExpenses = firebaseExpenses.filter((firebaseExpense) => firebaseExpense.id!==expense.id)
            // })
            let localExpenses;
            firebaseExpenses.map((expense) => {
               localExpenses = expenses.filter((firebaseExpense) => firebaseExpense.id!==expense.id)
            })
            console.log('firebase', firebaseExpenses)
            setSortExpenses([...expenses, ...firebaseExpenses]);
            // await setInitializing(false);
         }
         })
      } catch (error) {
         console.log('Firestore error', error);
      }

      setInitializing(false);

      // const navUnsubscribe = navigation.addListener('onLeaving', (e) => {
      //    submit();
      // })
      return () => {
         unsubscribe();
         // navUnsubscribe();
      }
 }, []);

   if (initializing) return <View style={styles.loadingContainer}>
      <LoadingScreen backgroundColor={'white'} color={'#6aab6a'}/>
   </View>

  return (
   <>
      <Container style={styles.container}>
         <View style={styles.expense}>
         <TextInput
            placeholder="Add an expense"
            value={titleDescription}
            onChangeText={value => setTitleDescription(value)}
            style={styles.textboxDescription}
         />
         {/* <TextInput
            placeholder="Price"
            value={titlePrice}
            onChangeText={value => setTitlePrice(value)}
            style={styles.textboxPrice}
         /> */}
         <CurrencyInput
            placeholder="Price"
            value={titlePrice}
            onChangeValue={value => setTitlePrice(value)}
            unit="£"
            delimiter=","
            separator="."
            precision={2}
            // onChangeText={(formattedValue) => {
            //    console.log(formattedValue); // $2,310.46
            // }}
            style={styles.textboxPrice}
         />
         
         <RButton title="Add" color="green" onPress={() => addExpense()} />
         </View>

         <ScrollView >
         {expenses.map(expense => (
            <ItemList
               key={expense.id}
               id={expense.id}
               description={expense.expense[0]}
               price={expense.expense[1]}
               editExpense={editExpense}
               deleteExpense={deleteExpense}
            />
         ))}
         </ScrollView>
      </Container>
      <Footer>
         <FooterTab style={{backgroundColor:"green"}}>
            <Button>
               {/* <Text style={{color:"white", fontWeight: 900}}>Total: </Text> */}
               <Text style={{color:"white"}}>Total: { totalCost }</Text>
            </Button>
         </FooterTab>
      </Footer>
   </>
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
   textboxDescription: {
      borderWidth: 1,
      borderColor: "green",
      borderRadius: 8,
      padding: 10,
      // paddingRight: 0,
      margin: 10,
      marginRight: 0, 
      marginLeft: 0, 
      width: "58%", 
      fontSize:16,
      height: 39
   },
   textboxPrice: {
      borderWidth: 1,
      borderColor: "green",
      borderRadius: 8,
      padding: 10,
      // paddingLeft: 3,
      margin: 10,
      marginLeft: 5, 
      width: "25%", 
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