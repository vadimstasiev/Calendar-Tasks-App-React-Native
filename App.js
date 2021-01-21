import React from "react";
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DayScreen from './screens/DayScreen';

const Stack = createStackNavigator();
const App = () => {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home">
            {props => <HomeScreen {...props} extraData={{}} />}
          </Stack.Screen>
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} extraData={{}} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {props => <RegisterScreen {...props} extraData={{}} />}
          </Stack.Screen>
          <Stack.Screen name="Day">
            {props => <DayScreen {...props} extraData={{}} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
  )
}

export default App;
