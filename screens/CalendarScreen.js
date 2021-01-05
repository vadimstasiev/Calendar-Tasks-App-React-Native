import _ from 'lodash';
import moment from 'moment';
import React, {useState, Fragment} from 'react';
import {StyleSheet, View, ScrollView, Text, TouchableOpacity} from 'react-native';
import {Calendar} from 'react-native-calendars';

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

const CalendarsScreen = () => {

  const getDisabledDates = (startDate, endDate, daysToDisable) => {
    const disabledDates = {};
    const start = moment(startDate);
    const end = moment(endDate);

    for (let m = moment(start); m.diff(end, 'days') <= 0; m.add(1, 'days')) {
      if (_.includes(daysToDisable, m.weekday())) {
        disabledDates[m.format('YYYY-MM-DD')] = {disabled: true};
      }
    }
    return disabledDates;
  };

   const renderCalendarWithPeriodMarkingAndDotMarking = () => {
      return (
      <Fragment>
         {/* <Text style={styles.text}>Calendar with period marking and dot marking</Text> */}
         <Calendar
            current={'2012-05-16'}
            minDate={'2012-05-01'}
            disabledDaysIndexes={[0, 6]}
            markingType={'period'}
            markedDates={{
            '2012-05-15': {marked: true, dotColor: '#50cebb'},
            '2012-05-16': {marked: true, dotColor: '#50cebb'},
            '2012-05-21': {startingDay: true, color: '#50cebb', textColor: 'white'},
            '2012-05-22': {
               color: '#70d7c7',
               customTextStyle: {
                  color: '#FFFAAA',
                  fontWeight: '700'
               }
            },
            '2012-05-23': {color: '#70d7c7', textColor: 'white', marked: true, dotColor: 'white'},
            '2012-05-24': {color: '#70d7c7', textColor: 'white'},
            '2012-05-25': {
               endingDay: true,
               color: '#50cebb',
               textColor: 'white',
               customContainerStyle: {
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5
               }
            },
            ...getDisabledDates('2012-05-01', '2012-05-30', [0, 6])
            }}
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