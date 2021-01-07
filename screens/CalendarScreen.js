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
  const defaultColor = "white";
  const colorOptions = ['#3a402a', '#688052', '#6aab6a', '#d9b358', '#fff2a7'];
  let defaultMood = 'None';
  const moods = {
     '#fff2a7':'Awesome',
     '#d9b358':'Good',
     '#6aab6a':'Fine',
     '#688052':'Bad',
     '#3a402a':'Terrible'
  }


  const dayPress = (dayData) => {
    console.log(dayData)
    const {day, month} = dayData;
    navigation.navigate('Day', {user, day, month, moods, defaultMood, colorOptions})
  }
  
  const renderCalendarWithPeriodMarkingAndDotMarking = () => {
      return (
      <Fragment>
         {/* <Text style={styles.text}>Calendar with period marking and dot marking</Text> */}
         <Calendar
            current={getCurrentDate()}
            // minDate={'2021-01-01'}
            // disabledDaysIndexes={[0, 6]}
            onDayPress={dayPress}
            markingType={'period'}
            markedDates={{
            '2021-05-14': {marked: true, dotColor: '#50cebb'},
            '2021-05-15': {marked: true, dotColor: 'red'},
            '2021-01-16': {marked: true, dotColor: '#50cebb'},
            '2021-01-21': {startingDay: true, color: '#50cebb', textColor: 'white'},
            '2021-01-22': {
               color: '#70d7c7',
               customTextStyle: {
                  color: '#FFFAAA',
                  fontWeight: '700'
               }
            },
            '2021-01-23': {color: '#70d7c7', textColor: 'white', marked: true, dotColor: 'white'},
            '2021-01-24': {color: '#70d7c7', textColor: 'white'},
            '2021-01-25': {
               endingDay: true,
               color: '#50cebb',
               textColor: 'white',
               customContainerStyle: {
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5
               }
            },
            // ...getDisabledDates('2021-01-01', '2021-01-30', [0, 6])
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