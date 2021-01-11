import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Alert,TouchableOpacity, Button as RButton } from "react-native";
import { Container, Header, Body, Text, Form, Textarea, Button, Item, Label, Input, Card, CardItem, Content, ListItem, CheckBox, Footer, FooterTab} from "native-base";
import ColorPalette from 'react-native-color-palette';

import Icon from "react-native-vector-icons/MaterialIcons";

import firestore from "@react-native-firebase/firestore";
import LoadingScreen from "./LoadingScreen";


import { FakeCurrencyInput } from 'react-native-currency-input';
import { ScrollView } from "react-native-gesture-handler";


let db = firestore();


const ColorBudgetSelector = ({pallete, deleteBudget, bgt}) => {



   const [budget, setBudget] = useState(bgt.budget);
   const [color, setColor] = useState(bgt.color);
   const [isEditing, setIsEditing] = useState(false);
   return <ListItem>
      {isEditing?
         <>
            <Card style={{width:"100%"}}>
               <CardItem >
                     <Form>
                        <Card style={{width:"100%"}}>
                              <FakeCurrencyInput
                                 value={budget}
                                 onChangeValue={value => setBudget(value)}
                                 unit="£"
                                 delimiter=","
                                 separator="."
                                 precision={2}
                                 editable={false}
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
                        <ColorPalette
                              onChange={ color => {
                                 setColor(color);
                                 setIsEditing(false);
                              }}
                              value={color}
                              titleStyles={{display:"none"}}
                              colors= {pallete}
                           />
                     </Form>
               </CardItem>
            </Card>
         </>
      :
         <>
            <TouchableOpacity
               style={styles.button}
               onPress={()=>deleteBudget(budget)}
               style={{width:"10%"}}
            >
               <Icon
                  name={"delete"}
                  size={25}
                  color="red"
               />
            </TouchableOpacity>
            <Card style={{width:"80%"}}>
                  <FakeCurrencyInput
                     value={budget}
                     onChangeValue={value => setBudget(value)}
                     unit="£"
                     delimiter=","
                     separator="."
                     precision={2}
                     editable={false}
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
            <ColorPalette
                  style={{width:"10%"}}
                  onChange={ color => {
                     setIsEditing(true)
                  }}
                  value={color}
                  titleStyles={{display:"none"}}
                  colors= {[color]}
                  icon={()=>{}}
               />
         </>
      }
   </ListItem>
}

const Notes = ({user, navigation}) => {

   const [initializing, setInitializing] = useState(true)


   const [budget, setBudget] = useState(0); 
   const [budgets, setBudgets] = useState([]); 

   const pallete = [
      '#C0392B', '#E74C3C', '#9B59B6', '#8E44AD', '#2980B9', '#3498DB', '#1ABC9C',
      '#16A085', '#27AE60', '#2ECC71', '#F1C40F', '#F39C12', '#E67E22', '#D35400',
      '#FFFFFF',
      '#BDC3C7', '#95A5A6', '#7F8C8D',
   ]

   const [color, setColor] = useState('#C0392B');
   const [isEditingColor, setIsEditingColor] = useState(false);



   const setSortedBudgets = (budgets) => {
      // var temp = habits.slice(0);
      setBudgets([...budgets.sort((a,b) => {
         var x = Number(a.budget);
         var y = Number(b.budget);
         return x < y ? -1 : x > y ? 1 : 0;
      })])
  }


   const addBudget = () => {
      const tempBudget = budget;
      const tempColor = color;
      console.log(user.uid, "budget")
      let budgetExists = false;
      budgets.map(bgt => {
         if(Number(bgt.budget)===Number(budget)){
            budgetExists=true;
         }
      })
      if(!budgetExists){
         db.collection("users").doc(user.uid).collection("budget").doc(String(budget)).set({
            color
         })
         .then(()=>{
            setSortedBudgets([...budgets, {budget, color}])
         })
         .catch((error) => {
            console.error("Error adding document: ", error);
         });
         setBudget(0)
      } else {
         Alert.alert(
            'Error adding',
            'The value that you have entered already exists!',
            [
              { text: 'OK', onPress: () => console.log('OK Pressed') }
            ],
            { cancelable: false }
          );
      }
   }

   const deleteBudget = (budget) =>{
      db.collection("users").doc(user.uid).collection("budget").doc(String(budget)).delete()
      .catch((error) => {
         console.error("Error adding document: ", error);
      });
   }

   useEffect(() => {
      navigation.setOptions({ title: "Calendar Budget Filter" })
      let unsubscribe = () => {};
      setInitializing(true);
      try {
         unsubscribe = db.collection("users").doc(user.uid).collection("budget").onSnapshot( querySnapshot=>{
            let temp = [];
            querySnapshot.forEach((doc)=>{
               temp.push({budget:doc.id, color: doc.data().color})
            })
            setSortedBudgets(temp);
         })
      } catch (error) {
         console.log('Firestore error', error);
      }
      setInitializing(false);
      return () => {
         unsubscribe();
      }
   }, []);


   if (initializing) return <View style={styles.loadingContainer}>
      <LoadingScreen backgroundColor={'white'} color={'#6aab6a'}/>
   </View>

   return <Container style={{width:"100%"}}>

      {isEditingColor?
      <View>
         <FakeCurrencyInput
            containerStyle={{width:"95%"}}
            placeholder="Add a budget limit"
            value={budget}
            unit="£"
            delimiter=","
            separator="."
            precision={2}
            onChangeValue={value => setBudget(value)}
            style={{
               borderWidth: 1,
               borderColor: "green",
               borderRadius: 8,
               padding: 10,
               marginTop:10,
               margin: 10,
               width: "100%",
               fontSize:16,
            }}
         />

         <View style={{flexDirection:'row',  alignItems: 'center', paddingLeft:14}}>
               <ColorPalette
                  onChange={ color => {
                     setColor(color);
                     setIsEditingColor(false);
                  }}
                  value={color}
                  titleStyles={{display:"none"}}
                  colors= {pallete}
               />
         </View>
      </View>
      :
      <View style={{
         flexDirection: "row",
         alignItems: "center"
      }}>
         <FakeCurrencyInput
            containerStyle={{width:"60%"}}
            value={budget}
            unit="£"
            delimiter=","
            separator="."
            precision={2}
            onChangeValue={value => setBudget(value)}
            style={{
               borderWidth: 1,
               borderColor: "green",
               borderRadius: 8,
               padding: 10,
               marginTop:10,
               margin: 10,
               width: "100%",
               fontSize:16,
            }}
         />

         <View style={{flexDirection:'row',  alignItems: 'center', paddingLeft:14}}>
               <ColorPalette
                  style = {{width:"100%"}}
                  onChange={ color => {
                     setIsEditingColor(true)
                  }}
                  value={color}
                  titleStyles={{display:"none"}}
                  colors= {[color]}
                  icon={<Icon name="edit" size={16} color={color!=='#FFFFFF'?"white":"black"}></Icon>}
               />
               <Button style={{  borderRadius:5, width:"40%", height:52, backgroundColor: '#2E8B57', justifyContent: 'center', }}
                  onPress={() => addBudget()}
               >
                  <Text>Add</Text>
               </Button>
         </View>
      </View>
      }
      <ScrollView padder>
         {budgets.map(bgt => 
            <ColorBudgetSelector key={bgt.budget} pallete={pallete} deleteBudget={deleteBudget} bgt={bgt}/>
         )}

      </ScrollView>
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