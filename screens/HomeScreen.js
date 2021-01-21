import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Container, Text, Button, Content, Footer, FooterTab } from "native-base";
import auth from "@react-native-firebase/auth";
import CalendarScreen from './CalendarScreen';
import BudgetScreen from './BudgetScreen';
import UsualExpenses from './UsualExpenses';
import LoadingScreen from "./LoadingScreen";

const HomeScreen = (props) => {
  const {navigation} = props;
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [screen, setScreen] = useState('Calendar');
  // Handle user state changes
  const onAuthStateChanged = async user => {
    if(user){
      setUser(user);
      await auth().currentUser.reload();
    }
    if (initializing) setInitializing(false);
  }
  
  const signOut =()=>{
    auth().signOut().then(() => {
      // clear the local user data
      setUser(undefined);
    })
  }
  
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [user, screen]);
  
  // show an initialization screen while the data is loading
  if (initializing) return <LoadingScreen backgroundColor={'white'}/>; 

  
  return (
    <Container>
      {
        user?
          <>
          <Content >
          {screen==='Calendar'?
              <CalendarScreen user={user} {...props}/>
            :<></>}
          {screen==='Budget'?
            <BudgetScreen user={user} {...props}/>
          :<></>}
          {screen==='UsualExpenses'?
            <UsualExpenses user={user} {...props}/>
          :<></>}
          </Content>
          <Footer>
            <FooterTab style={{backgroundColor:'green'}}>
              <Button style={{backgroundColor:(screen==='Calendar'?"#256525":"green")}} onPress={(e)=>setScreen('Calendar')}>
                <Text style={{color:'white'}}>Calendar</Text>
              </Button>
              <Button style={{backgroundColor:(screen==='Budget'?"#256525":"green")}} onPress={(e)=>setScreen('Budget')}>
                <Text style={{color:'white'}}>Budget</Text>
              </Button>
              <Button style={{backgroundColor:(screen==='UsualExpenses'?"#256525":"green")}} onPress={(e)=>setScreen('UsualExpenses')}>
                <Text style={{color:'white'}}>Usual Expenses</Text>
              </Button>
              <Button onPress={signOut}>
                <Text style={{color:'white'}}>Sign Out</Text>
              </Button>
            </FooterTab>
          </Footer>
          </>
          :
          <View>
          <Button full light info onPress={() => navigation.navigate('Login')} style={{margin:5}}>
            <Text>Login Screen</Text>
          </Button>
          <Button full onPress={() => navigation.navigate('Register')} style={{margin:5}}>
            <Text>Register Screen</Text>
          </Button>
          </View>
      }
    </Container>
  );
}
export default HomeScreen;