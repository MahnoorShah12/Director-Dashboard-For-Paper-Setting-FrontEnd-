// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import DateTimePicker from '@react-native-community/datetimepicker';

// import { BASE_URL } from '../../../../config/Api';

// export default function CreatePaper() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId, term } = route.params;
//   const termFromQuery = term || 'Mid';

//   const [sessions, setSessions] = useState([]);
//   const [formData, setFormData] = useState({
//     courseTitle: '',
//     courseCode: '',
//     sessionId: null,
//     sessionName: '',
//     examDate: '',
//     time: '',
//     duration: '',
//     degreeProgram: '',
//     totalMarks: '',
//     teachersName: '',
//     term: termFromQuery,
//     noOfQuestions: '',
//     paperExists: false,
//     paperId: null,
//     paperStatus: '',
//   });

//   const [loading, setLoading] = useState(true);
//   const [errors, setErrors] = useState({});
//   const [canView, setCanView] = useState(false);
//   const [canCreatePaper, setCanCreatePaper] = useState(false);

//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [timeStart, setTimeStart] = useState(null);
//   const [timeEnd, setTimeEnd] = useState(null);

//   useEffect(() => {
//     init();
//   }, []);

//  const init = async () => {
//   try {
//     const userId = await AsyncStorage.getItem('user_id');
//     const rolesData = await AsyncStorage.getItem('user_roles');

//     const roles = rolesData
//       ? JSON.parse(rolesData).map(r => r.toLowerCase())
//       : [];

//     if (!userId) {
//       navigation.replace('Login');
//       return;
//     }

//     const isDirector = roles.includes('director');

//     if (isDirector) {
//       setCanView(true);
//       fetchPaperInfo(courseId, termFromQuery);
//     } else {
//       checkCourseAssignment(userId, courseId, termFromQuery);
//     }

//   } catch (error) {
//     console.log("Storage error:", error);
//   }
// };
//   // const fetchSessions = async () => {
//   //   try {
//   //     const res = await axios.get(`${BASE_URL}/sessions`);
//   //     setSessions(res.data);
//   //   } catch (err) {
//   //     console.log('session error', err);
//   //   }
//   // };

//   const fetchPaperInfo = async (id, term) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${BASE_URL}/paper/get_PaperInFo_details/${id}`, { params: { term: term.toLowerCase() } });
//       const data = response.data;
//       const isApproved = data.paperStatus === 'Approved';

//       setFormData({
//         courseTitle: data.courseTitle || '',
//         courseCode: data.courseCode || '',
//         sessionId: data.sessionId,
//         sessionName: data.sessionName || '',
//         examDate: data.examDate ? data.examDate.split('T')[0] : '',
//         time: data.startTime && data.endTime ? `${to12HourFormat(data.startTime)} - ${to12HourFormat(data.endTime)}` : '',
//         duration: data.duration || '',
//         degreeProgram: data.degreeProgram || '',
//         totalMarks: data.totalMarks || '',
//         teachersName: data.teachersName || '',
//         term: data.term === 'mid' ? 'Mid' : 'Final',
//         noOfQuestions: data.noOfQuestions || '',
//         paperId: data.paperId || null,
//         paperStatus: data.paperStatus || '',
//         paperExists: data.paperExists || false,
//       });

//       setCanCreatePaper(!isApproved);
//       setCanView(true);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkCourseAssignment = async (userId, courseId, term) => {
//     try {
//       const response = await axios.get(`${BASE_URL}/paper/verify-teacher-teach-course/${userId}?courseId=${courseId}`);
//       const assignedCourse = response.data.Course;
//       if (!assignedCourse) {
//         navigation.replace('Unauthorized');
//         return;
//       }
//       setCanView(true);
//       setCanCreatePaper(response.data.CreatePaper || false);
//       fetchPaperInfo(courseId, term);
//     } catch (err) {
//       console.log(err);
//       navigation.replace('Unauthorized');
//     }
//   };

//   const handleChange = (name, value) => {
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setErrors(prev => {
//       const copy = { ...prev };
//       delete copy[name];
//       return copy;
//     });
//   };

//   const to12HourFormat = (time24) => {
//     if (!time24) return '';
//     let [hourStr, minute] = time24.split(':');
//     let hour = parseInt(hourStr);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     hour = hour % 12 || 12;
//     return `${hour}:${minute} ${ampm}`;
//   };

//   const to24HourFormat = (time12) => {
//     const [time, modifier] = time12.split(' ');
//     let [hours, minutes] = time.split(':');
//     if (modifier === 'PM' && hours !== '12') hours = (parseInt(hours) + 12).toString();
//     else if (modifier === 'AM' && hours === '12') hours = '00';
//     return `${hours}:${minutes}`;
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (formData.examDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.examDate)) {
//       newErrors.examDate = 'Date must be YYYY-MM-DD';
//     }
//     ['duration', 'totalMarks', 'noOfQuestions'].forEach(field => {
//       if (formData[field] && parseInt(formData[field]) < 0) newErrors[field] = `${field} cannot be negative`;
//     });
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSave = async () => {
//     if (!validateForm()) return;

//     if (formData.paperStatus === 'Approved') {
//       navigation.navigate('CreateQuestion', { paperId: formData.paperId });
//       return;
//     }

//     let startTime = timeStart ? timeStart.toTimeString().slice(0,5) : null;
//     let endTime = timeEnd ? timeEnd.toTimeString().slice(0,5) : null;

//     const payload = {
//       course_id: parseInt(courseId),
//       session_id: formData.sessionId,
//       term: formData.term.toLowerCase(),
//       paper_Date: formData.examDate || null,
//       Start_time: startTime,
//       end_time: endTime,
//       duration: parseInt(formData.duration) || null,
//       degree_programs: formData.degreeProgram || '',
//       total_marks: parseInt(formData.totalMarks) || null,
//       teacher_name: formData.teachersName || '',
//       no_of_questions: parseInt(formData.noOfQuestions) || null
//     };

//     try {
//       const response = await axios.post(`${BASE_URL}/paper/CreateOrUpdate`, payload);
//       if (response.status === 200) {
//         navigation.navigate('CreateQuestion', { paperId: formData.paperId });
//       }
//     } catch (err) {
//       console.log(err);
//       Alert.alert('Error', 'Failed to save paper');
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" />
//         <Text>Loading paper details...</Text>
//       </View>
//     );
//   }

//   if (!canView) return null;

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Paper Information</Text>
//       <Text style={styles.course}>{formData.courseTitle}</Text>
//       <Text style={styles.code}>Course Code: {formData.courseCode}</Text>

//       {Object.values(errors).map((err, i) => (
//         <Text key={i} style={styles.error}>{err}</Text>
//       ))}

//       {/* Session Dropdown */}
      
//         <View style={styles.formGroup}>
//   <Text style={styles.label}>Session</Text>
//   <TextInput
//     style={styles.input}
//     value={formData.sessionName}
//     editable={false}
//   />
// </View>
     

//       {/* Date Picker */}
//       <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
//         <Text>{formData.examDate || 'Select Date'}</Text>
//       </TouchableOpacity>
//       {showDatePicker && (
//         <DateTimePicker
//           value={formData.examDate ? new Date(formData.examDate) : new Date()}
//           mode="date"
//           display="default"
//           onChange={(event, date) => {
//             setShowDatePicker(false);
//             if (date) handleChange('examDate', date.toISOString().split('T')[0]);
//           }}
//         />
//       )}

//       {/* Time Picker for Start Time */}
//       <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
//         <Text>{formData.time || 'Select Time Range'}</Text>
//       </TouchableOpacity>
//       {showTimePicker && (
//         <DateTimePicker
//           value={timeStart || new Date()}
//           mode="time"
//           is24Hour={false}
//           display="default"
//           onChange={(event, time) => {
//             setShowTimePicker(false);
//             if (time) {
//               setTimeStart(time);
//               const endTimeTemp = new Date(time.getTime() + 2*60*60*1000); // default 2 hr
//               setTimeEnd(endTimeTemp);
//               handleChange('time', `${time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTimeTemp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`);
//             }
//           }}
//         />
//       )}

//       {/* Other Inputs */}
//       <TextInput style={styles.input} placeholder="Duration" value={String(formData.duration)} onChangeText={v => handleChange('duration', v)} editable={formData.paperStatus !== 'Approved'} />
//       <TextInput style={styles.input} placeholder="Degree Program" value={formData.degreeProgram} onChangeText={v => handleChange('degreeProgram', v)} editable={formData.paperStatus !== 'Approved'} />
//       <TextInput style={styles.input} placeholder="Total Marks" value={String(formData.totalMarks)} onChangeText={v => handleChange('totalMarks', v)} editable={formData.paperStatus !== 'Approved'} />
//       <TextInput style={styles.input} value={formData.teachersName} editable={false} />
//       <TextInput style={styles.input} value={formData.term} editable={false} />
//       <TextInput style={styles.input} placeholder="No of Questions" value={String(formData.noOfQuestions)} onChangeText={v => handleChange('noOfQuestions', v)} editable={formData.paperStatus !== 'Approved'} />

//       <TouchableOpacity style={styles.btn} onPress={handleSave}>
//         <Text style={styles.btnText}>{formData.paperStatus === 'Approved' ? 'View Questions' : 'SAVE'}</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
//   course: { fontSize: 18, fontWeight: '600' },
//   code: { marginBottom: 20 },
//   input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
//   formGroup: { marginBottom: 15 },
//   label: { fontSize: 16, marginBottom: 5 },
//   dropdown: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
//   option: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
//   btn: { backgroundColor: '#0aa36c', padding: 15, borderRadius: 10, alignItems: 'center' },
//   btnText: { color: '#fff', fontWeight: 'bold' },
//   error: { color: 'red' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BASE_URL } from '../../../../config/Api';

// ─── Theme ────────────────────────────────────────────────────────
const C = {
  primary50: '#ecfdf5',
  primary100: '#d1fae5',
  primary200: '#a7f3d0',
  primary500: '#10b981',
  primary600: '#059669',
  primary700: '#047857',

  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  error: '#ef4444',
  errorBg: '#fef2f2',

  white: '#ffffff',
};

// ─── Helper: 24h → 12h ───────────────────────────────────────────
const to12HourFormat = (time24) => {
  if (!time24) return '';

  const [hourStr, minute] = time24.split(':');

  let hour = parseInt(hourStr, 10);

  const ampm = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${ampm}`;
};

// ─── Helper: 12h → 24h ───────────────────────────────────────────
const to24HourFormat = (time12) => {
  if (!time12) return null;

  const parts = time12.trim().split(' ');

  if (parts.length < 2) return null;

  const modifier = parts[1].toUpperCase();

  const [h, m] = parts[0].split(':');

  let hours = parseInt(h, 10);

  if (modifier === 'PM' && hours !== 12) hours += 12;

  if (modifier === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${m}`;
};

// ─── Form Field ───────────────────────────────────────────────────
const FormField = ({ label, children, error }) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>{label}</Text>

    {children}

    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

// ─── Read Only Input ─────────────────────────────────────────────
const ReadOnlyInput = ({ value }) => (
  <View style={[styles.input, styles.inputReadOnly]}>
    <Text style={styles.readOnlyText}>{value || '—'}</Text>
  </View>
);

// ─── Time Range Picker ───────────────────────────────────────────
// // ─── Time Range Picker ───────────────────────────────────────────
// const TimeRangePickerModal = ({ visible, onClose, onConfirm }) => {
//   const [step, setStep] = useState('start');
//   const [startDate, setStartDate] = useState(new Date());

//   useEffect(() => {
//     if (visible) {
//       setStep('start');
//       setStartDate(new Date());
//     }
//   }, [visible]);

//   if (!visible) return null;

//   const handleChange = (event, selectedDate) => {
//     if (event?.type === 'dismissed') {
//       onClose();
//       return;
//     }
//     if (!selectedDate) return;

//     if (step === 'start') {
//   setStartDate(selectedDate);

//   if (Platform.OS === 'android') {
//     setTimeout(() => {
//       setStep('end');
//     }, 0);
//   }
// } else {
//   const fmt = (d) =>
//     d.toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true,
//     });

//   setTimeout(() => {
//     onConfirm(selectedDate, startDate, selectedDate, fmt(startDate), fmt(selectedDate));
//     onClose();
//   }, 0);
// }}

//   // ─── Android: render picker directly (no Modal wrapper) ──────
//   if (Platform.OS === 'android') {
//     return (
//       <DateTimePicker
//         value={step === 'start' ? startDate : new Date()}
//         mode="time"
//         is24Hour={false}
//         display="default"
//         onChange={handleChange}
//       />
//     );
//   }

const TimeRangePickerModal = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState('start');

  const [startDate, setStartDate] = useState(
    new Date()
  );

  const [endDate, setEndDate] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000)
  );

  useEffect(() => {
    if (visible) {
      const now = new Date();

      setStep('start');

      setStartDate(now);

      setEndDate(
        new Date(now.getTime() + 60 * 60 * 1000)
      );
    }
  }, [visible]);

  if (!visible) return null;

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // ANDROID
  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={step === 'start' ? startDate : endDate}
        mode="time"
        is24Hour={false}
        display="default"
        onChange={(event, selectedDate) => {
          if (event.type === 'dismissed') {
            onClose();
            return;
          }

          if (!selectedDate) return;

          if (step === 'start') {
            setStartDate(selectedDate);

            setStep('end');
          } else {
            setEndDate(selectedDate);

            onConfirm(
              selectedDate,
              startDate,
              selectedDate,
              formatTime(startDate),
              formatTime(selectedDate)
            );

            onClose();
          }
        }}
      />
    );
  }
  // ─── iOS: use Modal wrapper ───────────────────────────────────
   return (
    <Modal transparent animationType="fade">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>
            {step === 'start'
              ? '⏰ Select Start Time'
              : '⏰ Select End Time'}
          </Text>

          <DateTimePicker
            value={
              step === 'start'
                ? startDate
                : endDate
            }
            mode="time"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (!selectedDate) return;

              if (step === 'start') {
                setStartDate(selectedDate);
              } else {
                setEndDate(selectedDate);
              }
            }}
          />

          <View style={styles.pickerActions}>
            <TouchableOpacity
              style={styles.pickerCancelBtn}
              onPress={onClose}
            >
              <Text style={styles.pickerCancelText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerConfirmBtn}
              onPress={() => {
                if (step === 'start') {
                  setStep('end');
                } else {
                  onConfirm(
                    endDate,
                    startDate,
                    endDate,
                    formatTime(startDate),
                    formatTime(endDate)
                  );

                  onClose();
                }
              }}
            >
              <Text style={styles.pickerConfirmText}>
                {step === 'start'
                  ? 'Next'
                  : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
// ─── Date Picker ─────────────────────────────────────────────────
const DatePickerModal = ({ visible, value, onClose, onConfirm }) => {
  const [date, setDate] = useState(
    value ? new Date(value) : new Date()
  );

  useEffect(() => {
    if (visible) {
      setDate(value ? new Date(value) : new Date());
    }
  }, [visible, value]);

  if (!visible) return null;

  const handleChange = (event, selectedDate) => {
    if (event?.type === 'dismissed') {
      onClose();
      return;
    }

    if (!selectedDate) return;

    setDate(selectedDate);

    if (Platform.OS === 'android') {
      const formatted = selectedDate.toISOString().split('T')[0];
      onConfirm(formatted);
      onClose();
    }
  };

  
        
                 return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>📅 Select Exam Date</Text>

          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleChange}
          />

          {Platform.OS === 'ios' && (
            <View style={styles.pickerActions}>
              <TouchableOpacity
                style={styles.pickerCancelBtn}
                onPress={onClose}
              >
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pickerConfirmBtn}
                onPress={() => {
                  const formatted = date.toISOString().split('T')[0];
                  onConfirm(formatted);
                  onClose();
                }}
              >
                <Text style={styles.pickerConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};


// ─── Main Component ──────────────────────────────────────────────
export default function CreatePaper() {
  const navigation = useNavigation();

  const route = useRoute();

  const { courseId, term, type } = route.params || {};

  const termFromQuery = term || 'Mid';

  const typeFromQuery = type || 'theory';

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
    type: typeFromQuery,
    noOfQuestions: '',
    paperExists: false,
    paperId: null,
    paperStatus: '',
  });

  const [loading, setLoading] = useState(true);

  const [errors, setErrors] = useState({});

  const [canView, setCanView] = useState(false);

  const [canCreatePaper, setCanCreatePaper] =
    useState(false);

  const [userRoles, setUserRoles] = useState([]);

  const [timeStartDate, setTimeStartDate] =
    useState(null);

  const [timeEndDate, setTimeEndDate] =
    useState(null);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  // ─── Init ────────────────────────────────────────────────────
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const userId =
        await AsyncStorage.getItem('user_id');

      const rolesRaw =
        await AsyncStorage.getItem('user_roles');

      const roles = rolesRaw
        ? JSON.parse(rolesRaw).map((r) =>
            r.toLowerCase()
          )
        : [];

      setUserRoles(roles);

      if (!userId) {
        navigation.replace('Login');
        return;
      }

      const isDirector = roles.includes('director');

      if (isDirector) {
        setCanView(true);

        setCanCreatePaper(true);

        fetchPaperInfo(courseId, termFromQuery, true);
      } else {
        checkCourseAssignment(
          userId,
          courseId,
          termFromQuery
        );
      }
    } catch (err) {
      console.log('Init error:', err);
    }
  };

  // ─── Fetch Paper ─────────────────────────────────────────────
  const fetchPaperInfo = async (
    id,
    term,
    isDirector = false
  ) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/paper/get_PaperInFo_details/${id}`,
        {
          params: {
            term: term.toLowerCase(),
            type: typeFromQuery.toLowerCase(),
          },
        }
      );

      const data = response.data;

      const timeString =
        data.startTime && data.endTime
          ? `${to12HourFormat(
              data.startTime
            )} - ${to12HourFormat(data.endTime)}`
          : '';

      setFormData({
        courseTitle: data.courseTitle || '',
        courseCode: data.courseCode || '',
        sessionId: data.sessionId,
        sessionName: data.sessionName || '',
        examDate: data.examDate
          ? data.examDate.split('T')[0]
          : '',
        time: timeString,
        duration:
          data.duration != null
            ? String(data.duration)
            : '',
        degreeProgram: data.degreeProgram || '',
        totalMarks:
          data.totalMarks != null
            ? String(data.totalMarks)
            : '',
        teachersName: data.teachersName || '',
        term:
          data.term === 'mid' ? 'Mid' : 'Final',
        type: data.type || typeFromQuery,
        noOfQuestions:
          data.noOfQuestions != null
            ? String(data.noOfQuestions)
            : '',
        paperId: data.paperId || null,
        paperStatus: data.paperStatus || '',
        paperExists: data.paperExists || false,
      });

      if (isDirector) {
        setCanCreatePaper(true);
      }

      setCanView(true);
    } catch (err) {
      console.log(err);

      Alert.alert(
        'Error',
        'Failed to load paper details.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Check Course Assignment ─────────────────────────────────
  const checkCourseAssignment = async (
    userId,
    courseId,
    term
  ) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/paper/verify-teacher-teach-course/${userId}?courseId=${courseId}`
      );

      const assignedCourse = response.data.Course;

      if (!assignedCourse) {
        navigation.replace('Unauthorized');
        return;
      }

      setCanView(true);

      setCanCreatePaper(
        response.data.CreatePaper || false
      );

      fetchPaperInfo(courseId, term);
    } catch (err) {
      console.log(err);

      navigation.replace('Unauthorized');
    }
  };

  // ─── Handle Change ───────────────────────────────────────────
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      const copy = { ...prev };

      delete copy[name];

      return copy;
    });
  };

  // ─── Validation ──────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};

    if (
      formData.examDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(formData.examDate)
    ) {
      newErrors.examDate =
        'Date must be YYYY-MM-DD';
    }

    ['duration', 'totalMarks', 'noOfQuestions'].forEach(
      (field) => {
        if (
          formData[field] &&
          parseInt(formData[field]) < 0
        ) {
          newErrors[field] =
            `${field} cannot be negative`;
        }
      }
    );

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ─── Save ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;

    if (formData.paperStatus === 'Approved') {
      navigateToQuestions();
      return;
    }

    let startTime = null;

    let endTime = null;

    if (timeStartDate && timeEndDate) {
      startTime = timeStartDate
        .toTimeString()
        .slice(0, 5);

      endTime = timeEndDate
        .toTimeString()
        .slice(0, 5);
    } else if (
      formData.time &&
      formData.time.includes(' - ')
    ) {
      const [t1, t2] = formData.time
        .split(' - ')
        .map((t) => t.trim());

      startTime = to24HourFormat(t1);

      endTime = to24HourFormat(t2);
    }

    const payload = {
      course_id: parseInt(courseId),

      session_id: formData.sessionId,

      term: formData.term.toLowerCase(),

      type: typeFromQuery ,

      paper_Date: formData.examDate || null,

      Start_time: startTime,

      end_time: endTime,

      duration:
        parseInt(formData.duration) || null,

      degree_programs:
        formData.degreeProgram || '',

      total_marks:
        parseInt(formData.totalMarks) || null,

      teacher_name:
        formData.teachersName || '',

      no_of_questions:
        parseInt(formData.noOfQuestions) || null,
    };

    try {
      
      const response = await axios.post(
        `${BASE_URL}/paper/CreateOrUpdate`,
        payload
      );

      if (response.status === 200) {
        Alert.alert(
        'Error',
        'Fadfffffgg.'
      );
        navigateToQuestions();

      }
    } catch (err) {
      console.log(err);

      Alert.alert(
        'Error',
        'Failed to save paper.'
      );
    }
  };

  // ─── Navigate ────────────────────────────────────────────────
  const navigateToQuestions = () => {
    if (typeFromQuery === 'lab') {
      navigation.navigate('LabCreateQuestion', {
        paperId: formData.paperId,
      });
    } else {
      navigation.navigate('CreateQuestion', {
        paperId: formData.paperId,
      });
    }
  };

  // ─── Only approved paper locked ──────────────────────────────
  const isLocked =
    formData.paperStatus === 'Approved';

  // ─── Button Text ─────────────────────────────────────────────
  const buttonLabel =
    formData.paperStatus === 'Approved'
      ? 'View Questions'
      : !canCreatePaper &&
        !userRoles.includes('director')
      ? 'Next'
      : 'SAVE';

  // ─── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator
            size="large"
            color={C.primary600}
          />

          <Text style={styles.loadingText}>
            Loading paper details...
          </Text>
        </View>
      </View>
    );
  }

  if (!canView) return null;

  // ─── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.paperCard}>
          {/* ─── Title ─── */}
          <View style={styles.cardTitleRow}>
            <View style={styles.cardTitleAccent} />

            <Text style={styles.cardTitle}>
              {formData.type
                ? formData.type.charAt(0).toUpperCase() +
                  formData.type.slice(1)
                : ''}{' '}
              Paper Information
            </Text>
          </View>

          {/* ─── Course ─── */}
          <Text style={styles.courseHeading}>
            {formData.courseTitle}
          </Text>

          <View style={styles.courseCodeBadge}>
            <Text style={styles.courseCodeText}>
              Course Code: {formData.courseCode}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Session */}
          <FormField label="Session">
            <ReadOnlyInput
              value={formData.sessionName}
            />
          </FormField>

          {/* Date */}
          <FormField
            label="Date of Exam"
            error={errors.examDate}
          >
            <TouchableOpacity
              style={[
                styles.input,
                styles.inputTouchable,
              ]}
              activeOpacity={0.7}
              onPress={() => {
                if (!isLocked) {
                  setShowDatePicker(true);
                }
              }}
            >
              <Text
                style={[
                  styles.inputText,
                  !formData.examDate &&
                    styles.inputPlaceholder,
                ]}
              >
                {formData.examDate ||
                  'Select Exam Date'}
              </Text>

              {!isLocked && (
                <Text style={styles.inputIcon}>
                  📅
                </Text>
              )}
            </TouchableOpacity>
          </FormField>

          {/* Time */}
          <FormField
            label="Time"
            error={errors.time}
          >
            <TouchableOpacity
              style={[
                styles.input,
                styles.inputTouchable,
              ]}
              activeOpacity={0.7}
              onPress={() => {
                if (!isLocked) {
                  setShowTimePicker(true);
                }
              }}
            >
              <Text
                style={[
                  styles.inputText,
                  !formData.time &&
                    styles.inputPlaceholder,
                ]}
              >
                {formData.time ||
                  '09:00 AM - 12:00 PM'}
              </Text>

              {!isLocked && (
                <Text style={styles.inputIcon}>
                  ⏰
                </Text>
              )}
            </TouchableOpacity>
          </FormField>

          {/* Duration */}
          <FormField
            label="Duration"
            error={errors.duration}
          >
            <TextInput
              style={[
                styles.input,
                isLocked &&
                  styles.inputReadOnly,
              ]}
              value={formData.duration}
              onChangeText={(v) =>
                handleChange('duration', v)
              }
              editable={
                formData.paperStatus !==
                'Approved'
              }
              keyboardType="numeric"
              placeholder="Duration"
            />
          </FormField>

          {/* Degree Program */}
          <FormField label="Degree Program">
            <TextInput
              style={[
                styles.input,
                isLocked &&
                  styles.inputReadOnly,
              ]}
              value={formData.degreeProgram}
              onChangeText={(v) =>
                handleChange(
                  'degreeProgram',
                  v
                )
              }
              editable={
                formData.paperStatus !==
                'Approved'
              }
              placeholder="Degree Program"
            />
          </FormField>

          {/* Total Marks */}
          <FormField
            label="Total Marks"
            error={errors.totalMarks}
          >
            <TextInput
              style={[
                styles.input,
                isLocked &&
                  styles.inputReadOnly,
              ]}
              value={formData.totalMarks}
              onChangeText={(v) =>
                handleChange(
                  'totalMarks',
                  v
                )
              }
              editable={
                formData.paperStatus !==
                'Approved'
              }
              keyboardType="numeric"
              placeholder="Total Marks"
            />
          </FormField>

          {/* Teacher */}
          <FormField label="Teacher's Name">
            <ReadOnlyInput
              value={formData.teachersName}
            />
          </FormField>

          {/* Term */}
          <FormField label="Term">
            <ReadOnlyInput value={formData.term} />
          </FormField>

          {/* No Questions */}
          <FormField
            label="No of Questions"
            error={errors.noOfQuestions}
          >
            <TextInput
              style={[
                styles.input,
                isLocked &&
                  styles.inputReadOnly,
              ]}
              value={formData.noOfQuestions}
              onChangeText={(v) =>
                handleChange(
                  'noOfQuestions',
                  v
                )
              }
              editable={
                formData.paperStatus !==
                'Approved'
              }
              keyboardType="numeric"
              placeholder="No of Questions"
            />
          </FormField>

          {/* Save */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>
              {buttonLabel}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Date Picker ─── */}
      <DatePickerModal
        visible={showDatePicker}
        value={formData.examDate}
        onClose={() =>
          setShowDatePicker(false)
        }
        onConfirm={(dateStr) => {
          handleChange('examDate', dateStr);

          setShowDatePicker(false);
        }}
      />

      {/* ─── Time Picker ─── */}
      <TimeRangePickerModal
      //  key={showTimePicker} 
        visible={showTimePicker}
        onClose={() =>
          setShowTimePicker(false)
        }
        onConfirm={(
          endDate,
          startD,
          endD,
          startStr,
          endStr
        ) => {
          setTimeStartDate(startD);

          setTimeEndDate(endD);

          handleChange(
            'time',
            `${startStr} - ${endStr}`
          );

          setShowTimePicker(false);
        }}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  loadingCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: C.gray700,
    fontSize: 15,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },

  paperCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.primary100,
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  cardTitleAccent: {
    width: 4,
    height: 26,
    backgroundColor: C.primary600,
    borderRadius: 10,
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.gray900,
  },

  courseHeading: {
    fontSize: 17,
    fontWeight: '600',
    color: C.gray800,
    marginBottom: 8,
  },

  courseCodeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.primary50,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 18,
  },

  courseCodeText: {
    color: C.primary700,
    fontWeight: '600',
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: C.gray100,
    marginBottom: 20,
  },

  formGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.gray700,
    marginBottom: 7,
  },

  input: {
    borderWidth: 1.5,
    borderColor: C.gray200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical:
      Platform.OS === 'ios' ? 13 : 11,
    fontSize: 14,
    backgroundColor: C.white,
    color: C.gray800,
  },

  inputTouchable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  inputText: {
    fontSize: 14,
    color: C.gray800,
  },

  inputPlaceholder: {
    color: C.gray400,
  },

  inputIcon: {
    fontSize: 16,
  },

  inputReadOnly: {
    backgroundColor: C.gray50,
  },

  readOnlyText: {
    color: C.gray600,
    fontSize: 14,
  },

  errorText: {
    color: C.error,
    marginTop: 5,
    fontSize: 12,
  },

  saveBtn: {
    backgroundColor: C.primary600,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },

  saveBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },

  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  pickerCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    paddingTop: 24,
    paddingBottom: 16,
  },

  pickerTitle: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    color: C.gray900,
  },

  pickerActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 10,
  },

  pickerCancelBtn: {
    flex: 1,
    backgroundColor: C.gray100,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  pickerCancelText: {
    color: C.gray700,
    fontWeight: '600',
  },

  pickerConfirmBtn: {
    flex: 1,
    backgroundColor: C.primary600,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  pickerConfirmText: {
    color: C.white,
    fontWeight: '700',
  },
});