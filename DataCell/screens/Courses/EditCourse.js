import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { BASE_URL } from '../../config/Api';
const EditCourse = ({ route, navigation }) => {
  const { course } = route.params; 
  // course = { id, course_code, title, credit_hours }

  const [code] = useState(course.course_code); // readonly
  const [title, setTitle] = useState(course.title);
  const [credit, setCredit] = useState(course.credit_hours);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!title || !credit) {
      Alert.alert('Validation', 'All fields are required');
      return;
    }

    const payload = {
      id: course.id,
      course_code: code,
      title: title.trim(),
      credit_hours: credit,
    };

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/course/edit_Course_data`,
        // 'http://192.168.137.1/fypProject/api/course/edit_Course_data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const message = await response.text();

      if (!response.ok) {
        Alert.alert('Error', message);
        return;
      }

      Alert.alert('Success', message);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Server not reachable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Courses</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Update Course</Text>

        <Text style={styles.label}>Course Code</Text>
        <View style={styles.readOnlyBox}>
          <Text style={styles.readOnlyText}>{code}</Text>
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <Text style={styles.label}>Credit Hours</Text>
        <TextInput
          value={credit}
          onChangeText={setCredit}
          placeholder="3(2-3)"
           placeholderTextColor="#999"
          style={styles.input}
        />

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.updateBtn}
            onPress={handleUpdate}
            disabled={loading}
          >
            <Text style={styles.updateText}>
              {loading ? 'Updating...' : 'Update Course'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default EditCourse;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: '#0B8F5A',
    padding: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  back: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B8F5A',
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#0B8F5A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  readOnlyBox: {
    backgroundColor: '#F1F3F6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  readOnlyText: {
    fontSize: 15,
    color: '#0B8F5A',
    fontWeight: '600',
  },

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    padding: 14,
    borderRadius: 10,
    marginRight: 10,
  },

  cancelText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },

  updateBtn: {
    flex: 1,
    backgroundColor: '#0B8F5A',
    padding: 14,
    borderRadius: 10,
  },

  updateText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
  },
});
