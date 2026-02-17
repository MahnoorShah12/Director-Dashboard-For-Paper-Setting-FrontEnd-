import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../config/Api';

const EditFaculty = ({ navigation, route }) => {

  /* SAFE FACULTY (NEVER UNDEFINED) */
  const faculty = useMemo(() => {
    return route?.params?.faculty ?? {};
  }, [route?.params?.faculty]);

  /* STATES (ALWAYS TOP LEVEL - NEVER CONDITIONAL) */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [designation, setDesignation] = useState('');
  const [loading, setLoading] = useState(false);

  /* LOAD DATA SAFELY */
  useEffect(() => {
    if (!faculty) return;

    setName(faculty.name || faculty.Name || '');
    setEmail(faculty.email || faculty.Email || '');
    setPhone(faculty.phone_no || faculty.Phone || '');
    setUsername(faculty.username || faculty.Username || '');
    setDesignation(faculty.designation || faculty.Designation || '');
  }, [faculty]);

  /* UPDATE FUNCTION */
  const handleUpdate = async () => {

    const facultyId = faculty?.id || faculty?.Id;

    if (!facultyId) {
      Alert.alert('Error', 'Faculty ID not found');
      return;
    }

    if (!name || !email || !username || !designation) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/faculty/edit_teacher_data`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Id: facultyId,
            Name: name,
            Email: email,
            Phone: phone,
            Username: username,
            Designation: designation,
          }),
        }
      );

      const msg = await response.text();

      if (response.ok) {
        Alert.alert('Success', msg || 'Faculty updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', msg || 'Update failed');
      }

    } catch (error) {
      Alert.alert('Error', 'Server not reachable');
    } finally {
      setLoading(false);
    }
  };

  /* UI */
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Faculty</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.form}>

        <Text style={styles.label}>Name</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={18} color="#121312" />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={18} color="#121312" />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.label}>Phone</Text>
        <View style={styles.inputRow}>
          <Ionicons name="call-outline" size={18} color="#121312" />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <Text style={styles.label}>Username</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person-circle-outline" size={18} color="#121312" />
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <Text style={styles.label}>Designation</Text>
        <View style={styles.inputRow}>
          <Ionicons name="briefcase-outline" size={18} color="#121312" />
          <TextInput
            style={styles.input}
            value={designation}
            onChangeText={setDesignation}
          />
        </View>

        <TouchableOpacity
          style={[styles.updateBtn, loading && { opacity: 0.6 }]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.updateText}>
            {loading ? 'Updating...' : 'Update Faculty Member'}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default EditFaculty;

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F3F6' },

  header: {
    height: 90,
    backgroundColor: '#0B8F5A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 35,
    paddingHorizontal: 20,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },

  form: { padding: 20 },

  label: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },

  input: {
    flex: 1,
    marginLeft: 8,
  },

  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B8F5A',
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 14,
  },

  updateText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
});
