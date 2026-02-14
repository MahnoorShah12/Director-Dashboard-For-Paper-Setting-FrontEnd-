import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../config/Api';
// const BASE_URL = 'http://192.168.137.1/fypProject/api/course'; 

const AddCourse = ({ navigation }) => {
  const [courseList, setCourseList] = useState([]);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [credit, setCredit] = useState('');

  /* ================= GET COURSES ================= */
  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/course/get_all_courses?page=1&pageSize=2000`);

      const json = await res.json();
      setCourseList(json.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load courses');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ================= ADD COURSE ================= */
  const handleAddCourse = async () => {
  const cleanCode = code.trim().toUpperCase();
  const cleanTitle = title.trim();
  const cleanCredit = credit.trim(); 
  
  if (!cleanCode || !cleanTitle || !cleanCredit) {
    Alert.alert('Validation Error', 'All fields are required');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/course/add-Course`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        course_code: cleanCode,
        title: cleanTitle,
        credit_hours: cleanCredit,
      }),
    });

    const text = await response.text();
    let result;
    try {
      result = text ? JSON.parse(text) : null;
    } catch (e) {
      result = { message: text }; 
    }

    if (!response.ok) {
      Alert.alert('Error', result?.message || text);
      return;
    }

    Alert.alert('Success', result?.message || 'Course added successfully');
    setCode('');
    setTitle('');
    setCredit('');
    fetchCourses(); // refresh the course list
  } catch (err) {
    console.log('POST ERROR:', err);
    Alert.alert('Error', 'POST request failed');
  }
};


  /* ================= DELETE COURSE ================= */
  const handleDelete = (id) => {
    Alert.alert('Delete Course', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/course/delete_course/${id}`, {
              method: 'POST',
            });

            if (!res.ok) {
              Alert.alert('Error', 'Delete failed');
              return;
            }

            Alert.alert('Success', 'Course deleted');
            fetchCourses();
          } catch (err) {
            Alert.alert('Error', 'Something went wrong');
          }
        },
      },
    ]);
  };

  /* ================= COURSE CARD ================= */
  const renderCourse = ({ item }) => (
    <View style={styles.courseCard}>
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>{item.course_code}</Text>
        <Text style={styles.badgeGray}>{item.credit_hours}</Text>
      </View>

      <Text style={styles.courseTitle}>{item.title}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditCourse', { course: item })}
        >
          <Ionicons name="create-outline" size={18} color="#0B8F5A" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F1F3F6' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar backgroundColor="#0B8F5A" barStyle="light-content" />

      <FlatList
        data={courseList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCourse}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <View style={styles.headerWrapper}>
              <View style={styles.headerCard}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="chevron-back" size={26} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Courses</Text>
                <View style={{ width: 26 }} />
              </View>
            </View>

            {/* ADD COURSE */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Add New Course</Text>

              {[
                { icon: 'book-outline', placeholder: 'Course Code (CS-101)', value: code, set: setCode },
                { icon: 'reader-outline', placeholder: 'Course Title', value: title, set: setTitle },
                { icon: 'time-outline', placeholder: 'Credit Hours (e.g., 4(2-2))', value: credit, set: setCredit },
              ].map((f, i) => (
                <View style={styles.inputRow} key={i}>
                  <Ionicons name={f.icon} size={18} color="#131313" />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor="#999"
                    value={f.value}
                    onChangeText={f.set}
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.addBtn} onPress={handleAddCourse}>
                <Ionicons name="add-outline" size={20} color="#fff" />
                <Text style={styles.addBtnText}>Add Course</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>All Courses</Text>
          </>
        }
      />
    </KeyboardAvoidingView>
  );
};

export default AddCourse;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  headerWrapper: { paddingHorizontal: 12, paddingTop: 12, marginBottom: 10 },
  headerCard: {
    height: 75,
    backgroundColor: '#0B8F5A',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 6,
  },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0B8F5A', marginBottom: 12 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  input: { flex: 1, paddingVertical: 14, marginLeft: 8 },
  addBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#0B8F5A',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0B8F5A', marginBottom: 12 },
  courseCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14 },
  badgeRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  badge: {
    backgroundColor: '#E9FBF3',
    color: '#0B8F5A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: '600',
  },
  badgeGray: {
    backgroundColor: '#F0F0F0',
    color: '#555',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  courseTitle: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#0B8F5A',
    borderRadius: 14,
    paddingVertical: 12,
    width: '48%',
  },
  editText: { color: '#0B8F5A', fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#FF4D4D',
    borderRadius: 14,
    paddingVertical: 12,
    width: '48%',
  },
  deleteText: { color: '#FF4D4D', fontWeight: '600' },
});
