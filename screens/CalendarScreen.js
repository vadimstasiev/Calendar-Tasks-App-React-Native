import _ from 'lodash';
import firestore from "@react-native-firebase/firestore";
import React, {useState, useEffect} from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {Calendar} from 'react-native-calendars';

let db = firestore();

const testIDs = {
  menu: {
    CONTAINER: 'menu',
    CALENDARS: 'calendars_btn',
    CALENDAR_LIST: 'calendar_list_btn',
    HORIZONTAL_LIST: 'horizontal_list_btn',
    AGENDA: 'agenda_btn',
    EXPANDABLE_CALENDAR: 'expandable_calendar_btn',
    WEEK_CALENDAR: 'week_calendar_btn'
  },
  calendars: {
    CONTAINER: 'calendars',
    FIRST: 'first_calendar',
    LAST: 'last_calendar'
  },
  calendarList: {CONTAINER: 'calendarList'},
  horizontalList: {CONTAINER: 'horizontalList'},
  agenda: {
    CONTAINER: 'agenda',
    ITEM: 'item'
  },
  expandableCalendar: {CONTAINER: 'expandableCalendar'},
  weekCalendar: {CONTAINER: 'weekCalendar'}
};



const CalendarsScreen = ({navigation, user}) => {
  navigation.setOptions({ title: `Calendar` });
  const [currentMonth, setCurrentMonth] = useState(String(new Date().getMonth() + 1))
  const [budgets, setBudgets] = useState([]); 
  const [days, setDays] = useState([])

  // converts a day/month integer to a 2 digit string, e.g. 2 => 02 , 9 => 09, 12 => 12
  const convertTwoDigit = (digit) => {
    if (digit.toString().length == 1) {
      return "0" + digit;
    }
    return digit;
  }

  const getCurrentDate=()=>{
    var day = new Date().getDate();
    var month = new Date().getMonth() + 1;
    var year = new Date().getFullYear();
    // return format: yyyy-mm-dd
    return year + '-' + convertTwoDigit(month) + '-' + convertTwoDigit(day); 
  }

  // get the date of the current month selected
  const getDate=(day)=>{
    var month = currentMonth;
    var year = new Date().getFullYear();
    // return format: yyyy-mm-dd
    return year + '-' + convertTwoDigit(month) + '-' + convertTwoDigit(day);
  }

  // action when clicking a day
  const dayPress = (dayData) => {
    const {day, month} = dayData;
    navigation.navigate('Day', {user, day: String(day), month: String(month)})
  }

  // sorting budget data so that the UI doesn't glitch
  const setSortedBudgets = (budgets) => {
    setBudgets([...budgets.sort((a,b) => {
       var x = Number(a.budget);
       var y = Number(b.budget);
       return x < y ? -1 : x > y ? 1 : 0;
    })])
  }

  // calculate the color of a given day based on the data retrieved from firestore
  const calculateColor = (budget) => {
    let color = 'default';
    budgets.map(bgt => {
      if (budget>=bgt.budget){
        color = bgt.color;
      }  
    })
    return color;
  }
  
  useEffect(() => {
    // get filtering colors for days 
    let unsubscribe1 = () => {};
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
    // get daily costs from month Collection
    try {
      unsubscribe2 = db.collection("users").doc(user.uid).collection(currentMonth).onSnapshot( querySnapshot=>{
        let temp = [];
        querySnapshot.forEach((doc)=>{
            temp.push({day:doc.id, totalCost: doc.data().totalCost})
        })
        setDays(temp);
      })
  } catch (error) {
      console.log('Firestore error', error);
  }
    return () => {
        unsubscribe1();
        unsubscribe2();
    }
  }, [])

  // generates the calendar data in the right format to pass straight into the calendar component
  const generateCalendarData = () => {
    const data = {}
    days.map(day => {
      const color = calculateColor(day.totalCost);
      data[getDate(day.day)] = {
        customStyles: {
          container: {
            backgroundColor: color=='default'?'#ffffff':color,
            elevation: 4
          },
          text: {
            color: color=='default'?'#000000':"#ffffff"
          }
        }
      }
    })
    return data;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} testID={testIDs.calendars.CONTAINER}>
      <Calendar
            current={getCurrentDate()}
            onDayPress={dayPress}
            markingType={'custom'}
            markedDates={{
            [getCurrentDate()]: {
              customStyles: {
                container: {
                  backgroundColor: 'white',
                  elevation: 2
                },
                text: {
                  color: 'red'
                }
              }
            }, 
            ...generateCalendarData(),
            
            }
            }
            onMonthChange={(data)=>setCurrentMonth(String(data.month))}
         />
    </ScrollView>
  );
};

export default CalendarsScreen;

const styles = StyleSheet.create({
  calendar: {
    marginBottom: 10
  },
  text: {
    textAlign: 'center',
    padding: 10,
    backgroundColor: 'lightgrey',
    fontSize: 16
  }
});