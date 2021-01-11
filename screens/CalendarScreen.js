import _ from 'lodash';
import moment from 'moment';

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import React, {useState, Fragment} from 'react';
import {StyleSheet, View, ScrollView, Text, TouchableOpacity} from 'react-native';
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

 const getCurrentDate=()=>{

  var date = new Date().getDate();
  var month = new Date().getMonth() + 1;
  var year = new Date().getFullYear();

  const convertTwoDigit = (digit) => {
    if (digit.toString().length == 1) {
      return "0" + digit;
    }
    return digit;
  }

  // return '2012-05-16';
  return year + '-' + convertTwoDigit(month) + '-' + convertTwoDigit(date);//format: yyyy-mm-dd;
}

const CalendarsScreen = ({navigation, user}) => {

  navigation.setOptions({ title: `Calendar` });


  const dayPress = (dayData) => {
    console.log(dayData)
    const {day, month} = dayData;
    navigation.navigate('Day', {user, day: String(day), month: String(month)})
  }
  
  const renderCalendarWithPeriodMarkingAndDotMarking = () => {
      return (
      <Fragment>
         {/* <Text style={styles.text}>Calendar with period marking and dot marking</Text> */}
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
            '2021-01-08': {
              selected: true
            },
            '2021-01-09': {
              customStyles: {
                container: {
                  backgroundColor: 'red',
                  elevation: 4
                },
                text: {
                  color: 'white'
                }
              }
            },
            '2021-01-14': {
              customStyles: {
                container: {
                  backgroundColor: 'green'
                },
                text: {
                  color: 'white'
                }
              }
            },
            '2021-01-15': {
              customStyles: {
                container: {
                  backgroundColor: 'black',
                  elevation: 2
                },
                text: {
                  color: 'yellow'
                }
              }
            },
            '2021-01-21': {
              disabled: true
            },
            '2021-01-28': {
              customStyles: {
                text: {
                  color: 'black',
                  fontWeight: 'bold'
                }
              }
            },
            '2021-01-30': {
              customStyles: {
                container: {
                  backgroundColor: 'pink',
                  elevation: 4,
                  borderColor: 'purple',
                  borderWidth: 5
                },
                text: {
                  marginTop: 3,
                  fontSize: 11,
                  color: 'black'
                }
              }
            },
            
            }
            }
         />
      </Fragment>
      );
   };

 

  return (
    <ScrollView showsVerticalScrollIndicator={false} testID={testIDs.calendars.CONTAINER}>
      {renderCalendarWithPeriodMarkingAndDotMarking()}
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