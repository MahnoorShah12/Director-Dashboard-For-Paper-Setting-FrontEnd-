import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';

import FacultyScreen from '../screens/Faculty/FacultyScreen';
import EditFaculty from '../screens/Faculty/EditFaculty';

import AddCourse from '../screens/Courses/AddCourse';
import EditCourse from '../screens/Courses/EditCourse';
import AssignCourse from '../screens/Courses/AssignCourse';
//import ViewFaculty from '../screens/HOD/faculty/ViewFaculty';
import ViewFaculty from '../screens/HOD/faculty/ViewFaculty';
import ViewCourse from '../screens/HOD/course/ViewCourses';
import ViewCLO from '../screens/HOD/course/ViewCLO';
import ViewTopics from '../screens/HOD/course/ViewTopics';
import AssessmentPolicy from '../screens/HOD/course/AssessmentPolicy';


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Faculty" component={FacultyScreen} />
        <Stack.Screen name="EditFaculty" component={EditFaculty} />
        <Stack.Screen name="AddCourse" component={AddCourse} />
        <Stack.Screen name="EditCourse" component={EditCourse} />
         {/* HOD */}
         <Stack.Screen name="ViewFaculty" component={ViewFaculty} /> 
         <Stack.Screen name="ViewCourse" component={ViewCourse} /> 
         <Stack.Screen name="CLO" component={ViewCLO}  />
         <Stack.Screen name="Topics" component={ViewTopics}  />
          <Stack.Screen name="AssessmentPolicy" component={AssessmentPolicy}  />
          {/* {/datacell} */}
         
             <Stack.Screen name="AssignCourse" component={AssignCourse}  />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
