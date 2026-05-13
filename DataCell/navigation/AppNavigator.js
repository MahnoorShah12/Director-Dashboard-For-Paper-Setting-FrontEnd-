import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from "react-native-safe-area-context";

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';

import FacultyScreen from '../screens/Faculty/FacultyScreen';
import EditFaculty from '../screens/Faculty/EditFaculty';

import AddCourse from '../screens/Courses/AddCourse';
import EditCourse from '../screens/Courses/EditCourse';
import AssignCourse from '../screens/Courses/AssignCourse';
import PaperVerification from '../screens/Courses/PaperVerification';
//import ViewFaculty from '../screens/HOD/faculty/ViewFaculty';
import ViewFaculty from '../screens/HOD/faculty/ViewFaculty';
import ViewCourse from '../screens/HOD/course/ViewCourses';
import ViewCLO from '../screens/HOD/course/ViewCLO';
import ViewTopics from '../screens/HOD/course/ViewTopics';
import AssessmentPolicy from '../screens/HOD/course/AssessmentPolicy';
import AssignPaper from '../screens/HOD/course/AssignPaper';
import DutySwitch from '../screens/Director/DutySwitch';
import VettingAlerts from '../screens/Director/VettingAlerts';
import MeetingScheduleByTimeTable from '../screens/Director/MeetingScheduleByTimeTable';
import MySubjects from '../screens/FacultyMember/MySubjects';

import SubjectClo from '../screens/FacultyMember/Subjects/CLO';
import SubjectTopic from '../screens/FacultyMember/Subjects/Topic';


import CreatePaper from '../screens/FacultyMember/Subjects/Paper/CreatePaper';
import CreateQuestion from '../screens/FacultyMember/Subjects/Paper/Question/CreateQuestion';

import AssignQuestionModal from '../screens/FacultyMember/Subjects/Paper/Question/AssignQuestionModal';
import CheckPolicyModal from '../screens/FacultyMember/Subjects/Paper/Question/CheckPolicyModal';
import Solution from '../screens/FacultyMember/Subjects/Paper/Question/Solution';
import ReorderQuestionsModal from '../screens/FacultyMember/Subjects/Paper/Question/ReorderQuestionsModal';

import LabAssignQuestionModal from '../screens/FacultyMember/Subjects/Paper/LabPaper/LabAssignQuestionModal';
import LabCheckPolicyModal from '../screens/FacultyMember/Subjects/Paper/LabPaper/LabCheckPolicyModal';
import LabReorderQuestionsModal from '../screens/FacultyMember/Subjects/Paper/LabPaper/LabReorderQuestionsModal';
import LabCreateQuestion from '../screens/FacultyMember/Subjects/Paper/LabPaper/LabCreateQuestion.js';



import LabSolution from '../screens/FacultyMember/Subjects/Paper/LabPaper/LabSolution';

import CurrentPapers from '../screens/Director/CurrentPapers';
import PastPaper from '../screens/Director/PastPaper';
import PastPaperView from '../screens/Director/PastPaperView';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Faculty" component={FacultyScreen} />
          <Stack.Screen name="EditFaculty" component={EditFaculty} />
          <Stack.Screen name="AddCourse" component={AddCourse} />
          <Stack.Screen name="EditCourse" component={EditCourse} />
          <Stack.Screen name="PaperVerification" component={PaperVerification} />

          {/* HOD */}
          <Stack.Screen name="ViewFaculty" component={ViewFaculty} />
          <Stack.Screen name="ViewCourse" component={ViewCourse} />
          <Stack.Screen name="CLO" component={ViewCLO} />
          <Stack.Screen name="Topics" component={ViewTopics} />
          <Stack.Screen name="AssessmentPolicy" component={AssessmentPolicy} />
          {/* {/datacell} */}

          <Stack.Screen name="AssignCourse" component={AssignCourse} />
          <Stack.Screen name="AssignPaper" component={AssignPaper} />
          {/* director */}
          <Stack.Screen name="DutySwitch" component={DutySwitch} />
          <Stack.Screen name="VettingAlerts" component={VettingAlerts} />
          <Stack.Screen name="CurrentPapers" component={CurrentPapers} />
          <Stack.Screen name="PastPaper" component={PastPaper} />
          <Stack.Screen name="PastPaperView" component={PastPaperView} />
          <Stack.Screen name="MeetingScheduleByTimeTable" component={MeetingScheduleByTimeTable} />

          {/* {FacultyMember} */}
          <Stack.Screen name="MySubjects" component={MySubjects} />
          <Stack.Screen name="ViewTopics" component={SubjectTopic} />
          <Stack.Screen name="ViewCLOs" component={SubjectClo} />
          <Stack.Screen name="CreatePaper" component={CreatePaper} />

          {/* Thoery */}



          <Stack.Screen name="CreateQuestion" component={CreateQuestion} />
          <Stack.Screen name="AssignQuestionModal" component={AssignQuestionModal} />
          <Stack.Screen name="CheckPolicyModal" component={CheckPolicyModal} />
          <Stack.Screen name="ReorderQuestionsModal" component={ReorderQuestionsModal} />
          <Stack.Screen name="Solution" component={Solution} />



          {/* LabPaper */}
          <Stack.Screen name="LabAssignQuestionModal" component={LabAssignQuestionModal} />
          <Stack.Screen name="LabCheckPolicyModal" component={LabCheckPolicyModal} />
          <Stack.Screen name="LabReorderQuestionModal" component={LabReorderQuestionsModal} />
          <Stack.Screen name="LabCreateQuestion" component={LabCreateQuestion} />
          <Stack.Screen name="LabSolution" component={LabSolution} />




        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
