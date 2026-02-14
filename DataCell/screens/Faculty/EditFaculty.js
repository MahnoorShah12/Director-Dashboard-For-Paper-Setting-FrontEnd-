import React, { useState, useEffect } from 'react';
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
  const { faculty } = route.params;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (faculty) {
      setName(faculty.name || faculty.Name || '');
      setEmail(faculty.email || faculty.Email || '');
      setPhone(faculty.phone || faculty.Phone || '');
      setUsername(faculty.username || '');
    }
  }, [faculty]);

  const handleUpdate = async () => {
    if (!name || !email || !username) {
      Alert.alert('Validation Error', 'Name, Email, and Username are required');
      return;
    }

    try {
      setLoading(true);
      //  const response = await fetch(
      //   'http://192.168.10.7/fypProject/api/faculty/edit_teacher_data',
     
       const response = await fetch(
              `${BASE_URL}/faculty/edit_teacher_data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            Id: faculty.id || faculty.Id,
            Name: name,
            Email: email,
            Phone: phone,
            Username: username,
          }),
        }
      );

      const msg = await response.text();

      if (response.ok) {
        Alert.alert('Success', msg || 'Faculty updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', msg || 'Failed to update faculty');
      }
    } catch {
      Alert.alert('Error', 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Faculty</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* FORM */}
      <View style={styles.form}>
        {/* NAME */}
        <Text style={styles.label}>Name</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={20} color="#080a09" />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            
          />
        </View>

        {/* EMAIL */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color="#080a09" />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@biit.edu.pk"
          />
        </View>

        {/* PHONE */}
        <Text style={styles.label}>Phone</Text>
        <View style={styles.inputRow}>
          <Ionicons name="call-outline" size={20} color="#080a09" />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+92 300 1234567"
          />
        </View>

        {/* USERNAME */}
        <Text style={styles.label}>Username</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person-circle-outline" size={20} color="#080a09" />
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
             placeholderTextColor="#999"
            placeholder="username"
          />
        </View>

        {/* UPDATE BUTTON */}
        <TouchableOpacity
          style={[styles.updateBtn, loading && { opacity: 0.6 }]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.updateText}>
            {loading ? 'Updating...' : 'Update Faculty'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditFaculty;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  header: {
    height: 90,
    backgroundColor: '#0B8F5A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },

  form: {
    padding: 20,
  },

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
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 4,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },

  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0B8F5A',
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 16,
  },

  updateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
