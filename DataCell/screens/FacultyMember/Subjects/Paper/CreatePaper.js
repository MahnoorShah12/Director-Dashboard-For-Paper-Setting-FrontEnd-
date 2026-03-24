import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { BASE_URL } from '../../../../config/Api';

export default function CreatePaper() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId, term } = route.params;
  const termFromQuery = term || 'Mid';

  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({
    courseTitle: '',
    courseCode: '',
    sessionId: null,
    sessionName: '',
    examDate: '',
    time: '',
    duration: '',
    degreeProgram: '',
    totalMarks: '',
    teachersName: '',
    term: termFromQuery,
    noOfQuestions: '',
    paperExists: false,
    paperId: null,
    paperStatus: '',
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [canView, setCanView] = useState(false);
  const [canCreatePaper, setCanCreatePaper] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeStart, setTimeStart] = useState(null);
  const [timeEnd, setTimeEnd] = useState(null);

  useEffect(() => {
    init();
  }, []);

 const init = async () => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    const rolesData = await AsyncStorage.getItem('user_roles');

    const roles = rolesData
      ? JSON.parse(rolesData).map(r => r.toLowerCase())
      : [];

    if (!userId) {
      navigation.replace('Login');
      return;
    }

    const isDirector = roles.includes('director');

    if (isDirector) {
      setCanView(true);
      fetchPaperInfo(courseId, termFromQuery);
    } else {
      checkCourseAssignment(userId, courseId, termFromQuery);
    }

  } catch (error) {
    console.log("Storage error:", error);
  }
};
  // const fetchSessions = async () => {
  //   try {
  //     const res = await axios.get(`${BASE_URL}/sessions`);
  //     setSessions(res.data);
  //   } catch (err) {
  //     console.log('session error', err);
  //   }
  // };

  const fetchPaperInfo = async (id, term) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/paper/get_PaperInFo_details/${id}`, { params: { term: term.toLowerCase() } });
      const data = response.data;
      const isApproved = data.paperStatus === 'Approved';

      setFormData({
        courseTitle: data.courseTitle || '',
        courseCode: data.courseCode || '',
        sessionId: data.sessionId,
        sessionName: data.sessionName || '',
        examDate: data.examDate ? data.examDate.split('T')[0] : '',
        time: data.startTime && data.endTime ? `${to12HourFormat(data.startTime)} - ${to12HourFormat(data.endTime)}` : '',
        duration: data.duration || '',
        degreeProgram: data.degreeProgram || '',
        totalMarks: data.totalMarks || '',
        teachersName: data.teachersName || '',
        term: data.term === 'mid' ? 'Mid' : 'Final',
        noOfQuestions: data.noOfQuestions || '',
        paperId: data.paperId || null,
        paperStatus: data.paperStatus || '',
        paperExists: data.paperExists || false,
      });

      setCanCreatePaper(!isApproved);
      setCanView(true);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const checkCourseAssignment = async (userId, courseId, term) => {
    try {
      const response = await axios.get(`${BASE_URL}/paper/verify-teacher-teach-course/${userId}?courseId=${courseId}`);
      const assignedCourse = response.data.Course;
      if (!assignedCourse) {
        navigation.replace('Unauthorized');
        return;
      }
      setCanView(true);
      setCanCreatePaper(response.data.CreatePaper || false);
      fetchPaperInfo(courseId, term);
    } catch (err) {
      console.log(err);
      navigation.replace('Unauthorized');
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const to12HourFormat = (time24) => {
    if (!time24) return '';
    let [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const to24HourFormat = (time12) => {
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = (parseInt(hours) + 12).toString();
    else if (modifier === 'AM' && hours === '12') hours = '00';
    return `${hours}:${minutes}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.examDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.examDate)) {
      newErrors.examDate = 'Date must be YYYY-MM-DD';
    }
    ['duration', 'totalMarks', 'noOfQuestions'].forEach(field => {
      if (formData[field] && parseInt(formData[field]) < 0) newErrors[field] = `${field} cannot be negative`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (formData.paperStatus === 'Approved') {
      navigation.navigate('CreateQuestion', { paperId: formData.paperId });
      return;
    }

    let startTime = timeStart ? timeStart.toTimeString().slice(0,5) : null;
    let endTime = timeEnd ? timeEnd.toTimeString().slice(0,5) : null;

    const payload = {
      course_id: parseInt(courseId),
      session_id: formData.sessionId,
      term: formData.term.toLowerCase(),
      paper_Date: formData.examDate || null,
      Start_time: startTime,
      end_time: endTime,
      duration: parseInt(formData.duration) || null,
      degree_programs: formData.degreeProgram || '',
      total_marks: parseInt(formData.totalMarks) || null,
      teacher_name: formData.teachersName || '',
      no_of_questions: parseInt(formData.noOfQuestions) || null
    };

    try {
      const response = await axios.post(`${BASE_URL}/paper/CreateOrUpdate`, payload);
      if (response.status === 200) {
        navigation.navigate('CreateQuestion', { paperId: formData.paperId });
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to save paper');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading paper details...</Text>
      </View>
    );
  }

  if (!canView) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Paper Information</Text>
      <Text style={styles.course}>{formData.courseTitle}</Text>
      <Text style={styles.code}>Course Code: {formData.courseCode}</Text>

      {Object.values(errors).map((err, i) => (
        <Text key={i} style={styles.error}>{err}</Text>
      ))}

      {/* Session Dropdown */}
      
        <View style={styles.formGroup}>
  <Text style={styles.label}>Session</Text>
  <TextInput
    style={styles.input}
    value={formData.sessionName}
    editable={false}
  />
</View>
     

      {/* Date Picker */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text>{formData.examDate || 'Select Date'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={formData.examDate ? new Date(formData.examDate) : new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) handleChange('examDate', date.toISOString().split('T')[0]);
          }}
        />
      )}

      {/* Time Picker for Start Time */}
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
        <Text>{formData.time || 'Select Time Range'}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={timeStart || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={(event, time) => {
            setShowTimePicker(false);
            if (time) {
              setTimeStart(time);
              const endTimeTemp = new Date(time.getTime() + 2*60*60*1000); // default 2 hr
              setTimeEnd(endTimeTemp);
              handleChange('time', `${time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTimeTemp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`);
            }
          }}
        />
      )}

      {/* Other Inputs */}
      <TextInput style={styles.input} placeholder="Duration" value={String(formData.duration)} onChangeText={v => handleChange('duration', v)} editable={formData.paperStatus !== 'Approved'} />
      <TextInput style={styles.input} placeholder="Degree Program" value={formData.degreeProgram} onChangeText={v => handleChange('degreeProgram', v)} editable={formData.paperStatus !== 'Approved'} />
      <TextInput style={styles.input} placeholder="Total Marks" value={String(formData.totalMarks)} onChangeText={v => handleChange('totalMarks', v)} editable={formData.paperStatus !== 'Approved'} />
      <TextInput style={styles.input} value={formData.teachersName} editable={false} />
      <TextInput style={styles.input} value={formData.term} editable={false} />
      <TextInput style={styles.input} placeholder="No of Questions" value={String(formData.noOfQuestions)} onChangeText={v => handleChange('noOfQuestions', v)} editable={formData.paperStatus !== 'Approved'} />

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>{formData.paperStatus === 'Approved' ? 'View Questions' : 'SAVE'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  course: { fontSize: 18, fontWeight: '600' },
  code: { marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  formGroup: { marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 5 },
  dropdown: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  option: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  btn: { backgroundColor: '#0aa36c', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  error: { color: 'red' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
