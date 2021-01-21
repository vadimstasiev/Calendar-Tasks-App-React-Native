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
import { Container, Card, CardItem, Button, Body, Footer, FooterTab } from 'native-base';
import Icon from "react-native-vector-icons/AntDesign";
import LoadingScreen from "./LoadingScreen";
import Spinner from 'react-native-spinkit';
import CurrencyInput from 'react-native-currency-input';
import { FakeCurrencyInput } from 'react-native-currency-input';
import Autocomplete from 'react-native-autocomplete-input';
import { firebase } from "@react-native-firebase/auth";


let db = firestore();

const ItemList = ({ id, description, price, editExpense, deleteExpense }) => {
   const [isEditing, setIsEditing] = useState('false');
   const [expenseDescription, setExpenseDescription] = useState(description);
   const [expensePrice, setExpensePrice] = useState(price);
   const [isSaving, setIsSaving] = useState(false);

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
                        onChangeText={value => setExpenseDescription(value)}
                     />
                  </CardItem>
               </Card>
               <Text style={{}}>Cost:</Text>
               <Card style={{width:"100%"}}>
                  <CardItem>
                     <FakeCurrencyInput
                        autoFocus={true}
                        style={{ width:"100%", margin:0, padding:0}} 
                        value={expensePrice}
                        onChangeValue={value => setExpensePrice(value)}
                        unit="£"
                        delimiter=","
                        separator="."
                        precision={2}
                     />
                  </CardItem>
               </Card>               
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
                     <FakeCurrencyInput
                        style={{ width:"100%", margin:0, padding:0, fontSize:12}} 
                        value={expensePrice}
                        onChangeValue={value => setExpensePrice(value)}
                        unit="£"
                        delimiter=","
                        separator="."
                        precision={2}
                        editable={false}
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
            color='red'
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
   const { user, day, month } = route.params;
   const [initializing, setInitializing] = useState(true)
   // Initalize empty array to store expenses
   const [expenses, setExpenses] = useState([]);
   const [titleDescription, setTitleDescription] = useState("");
   const [titlePrice, setTitlePrice] = useState("");
   const [totalCost, setTotalCost] = useState(0);
   const [usualExpenses, setUsualExpenses] = useState([]);

  // function to add expense object in expense list
  const addExpense = async () => {
      if (titleDescription.length > 0 && titlePrice!==null) {
         let sendToFirestoreexpenses = {}
         let description=titleDescription;
         let price=titlePrice;
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
  };

  const editExpense = (id, newDescription, newPrice) => {
      return db.collection("users").doc(user.uid).collection(month).doc(day).update({[id]:[newDescription, newPrice]})
  }


  // function to delete expense from the expense list
  const deleteExpense = id => {
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
      let unsubscribe1 = () => {};
      let unsubscribe2 = () => {};
      setInitializing(true);
      try {
         unsubscribe1 = db.collection("users").doc(user.uid).collection(month).doc(day).onSnapshot( async querySnapshot=>{
            let data = await querySnapshot.data()
            let firebaseExpenses = []
            if (data) {
               for (const id in data) {
                  if(id!=="totalCost"){
                     const expense = data[id];
                     firebaseExpenses.push({id, expense})
                  }
               }
            let localExpenses;
            let localTotalCost = 0;
            firebaseExpenses.map((expense) => {
               localTotalCost += Number(expense.expense[1]);
               localExpenses = expenses.filter((firebaseExpense) => firebaseExpense.id!==expense.id);
            })
            localTotalCost = Math.round(localTotalCost * 100) / 100
            setTotalCost(localTotalCost);
            db.collection("users").doc(user.uid).collection(month).doc(day).update({totalCost:localTotalCost})
            .catch((error) => {
               console.error("Error setting total cost: ", error);
            });
            setSortExpenses([...expenses, ...firebaseExpenses]);
         }
         })
      } catch (error) {
         console.log('Firestore error', error);
      }

      try {
         unsubscribe2 = db.collection("users").doc(user.uid).collection(month).doc('usualExpenses').onSnapshot( async querySnapshot=>{
            let data = await querySnapshot.data()
            let firebaseUsualExpenses = []
            if (data) {
               for (let id in data) {
                  const description = data[id];
                  firebaseUsualExpenses.push({id, description})
               }
            let localExpenses;
            firebaseUsualExpenses.map((usualExpense) => {
               localExpenses = usualExpenses.filter((firebaseusualExpense) => firebaseusualExpense.id!==usualExpense.id)
            })
            setUsualExpenses([...usualExpenses, ...firebaseUsualExpenses]);
         }
         })
      } catch (error) {
         console.log('Firestore error', error);
      }

      setInitializing(false);
      return () => {
         unsubscribe1();
         unsubscribe2();
      }
 }, []);

   // For Filtered Data
   const [filteredUsualExpenses, setFilteredUsualExpenses] = useState([]);
   // For Selected Data
   const [selectedValue, setSelectedValue] = useState({});
   

   const findExpense = (query) => {
      // Method called every time when we change the value of the input
      if (query) {
      // Making a case insensitive regular expression
      const regex = new RegExp(`${query.trim()}`, 'i');
      // Setting the filtered film array according the query
      setFilteredUsualExpenses(
            usualExpenses.filter((expense) => String(expense.description).search(regex) >= 0)
      );
      } 
      else {
      // If the query is null then return blank
      setFilteredUsualExpenses(usualExpenses)
      }
   };

   if (initializing) return <View style={styles.loadingContainer}>
      <LoadingScreen backgroundColor={'white'} color={'#6aab6a'}/>
   </View>

   return (
      <>
         <Container style={styles.container}>
            <View style={styles.expense}>
            <View
               style={{width:"55%"}}
            />
            <Autocomplete
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.autocompleteContainer}
            inputContainerStyle={styles.textboxDescription}
            // Data to show in suggestion
            data={filteredUsualExpenses}
            // Default value if you want to set something in input
            defaultValue={
               JSON.stringify(selectedValue) === '{}' ?
               '' :
               selectedValue.description
            }
            // Onchange of the text changing the state of the query
            // Which will trigger the findExpense method
            // To show the suggestions
            onChangeText={(text) => findExpense(text)}
            onFocus={()=>setFilteredUsualExpenses(usualExpenses)}
            onEndEditing={(e)=>{
               setTitleDescription(e.nativeEvent.text);
               setFilteredUsualExpenses([]);
               }
            }
            placeholder="Add an expense"
            renderItem={({item}) => (
               // For the suggestion view
               <TouchableOpacity
               onPress={() => {
                  setSelectedValue(item);
                  setFilteredUsualExpenses([]);
               }}>
               <Text style={styles.itemText}>
                     {item.description}
               </Text>
               </TouchableOpacity>
            )}
         />
            <CurrencyInput
               placeholder="Price"
               value={titlePrice}
               onChangeValue={value => setTitlePrice(value)}
               unit="£"
               delimiter=","
               separator="."
               precision={2}
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
                  <Text style={{color:"white", fontSize:20}}>Total:
                  <Text style={{color:"white", fontWeight: "bold", fontSize:30}}> £ { totalCost }</Text></Text>
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
      padding: 4,
      margin: 4,
      marginRight: 0, 
      marginLeft: 10, 
      width: "90%", 
      fontSize:16,
   },
   textboxPrice: {
      borderWidth: 1,
      borderColor: "green",
      borderRadius: 8,
      padding: 10,
      margin: 10,
      marginLeft: 5, 
      marginTop: 4, 
      width: "25%", 
      fontSize:16,
      height: 50
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
    autocompleteContainer: {
      flex: 1,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 1, 
      width: "60%",
    },
    descriptionContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    itemText: {
      fontSize: 15,
      paddingTop: 5,
      paddingLeft:10,
      paddingBottom: 5,
      margin: 2,
    },
    infoText: {
      textAlign: 'center',
      fontSize: 16,
    },
});

export default DayScreen;