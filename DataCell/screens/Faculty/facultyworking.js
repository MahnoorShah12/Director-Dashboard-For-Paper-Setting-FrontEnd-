import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { ScrollView } from 'react-native/types_generated/index';

const FacultyScreen = ({ navigation }) => {
  const [facultyList, setFacultyList] = useState([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFaculty = async () => {
    try {
      let url = 'http://192.168.31.125/fypProject/api/faculty/get_teachers';

      if (searchTerm.trim()) {
        url = `http://192.168.31.125/fypProject/api/faculty/search_teacher?search=${encodeURIComponent(
          searchTerm
        )}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setFacultyList(Array.isArray(data) ? data : data.data || []);
    } catch {
      Alert.alert('Error', 'Unable to connect to server');
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [searchTerm]);

  const handleAddFaculty = async () => {
    if (!name || !email || !username || !password || password !== confirmPassword) {
      Alert.alert('Error', 'Please fill all fields correctly');
      return;
    }

    try {
      const response = await fetch(
        'http://192.168.31.125/fypProject/api/faculty/add-teacher',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, username, password }),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Faculty added');
        fetchFaculty();
        setName('');
        setEmail('');
        setPhone('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch {
      Alert.alert('Error', 'Server error');
    }
  };

  const renderFaculty = ({ item }) => (
    <View style={styles.facultyCard}>
      <Text style={styles.name}>{item.Name || item.name}</Text>
      <Text style={styles.info}>{item.Email || item.email}</Text>
      <Text style={styles.info}>{item.Phone || item.phone}</Text>
    </View>
  );

  return (
    
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* ADD FACULTY FORM (NOT IN FLATLIST) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Faculty</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.addBtn} onPress={handleAddFaculty}>
            <Text style={styles.addBtnText}>Add Faculty</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <TextInput
          style={styles.search}
          placeholder="Search faculty..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        {/* FACULTY LIST */}
        <FlatList
          data={facultyList}
          keyExtractor={(item) => (item.Id || item.id).toString()}
          renderItem={renderFaculty}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default FacultyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', padding: 16 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },

  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  addBtn: {
    backgroundColor: '#00A86B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '600' },

  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  facultyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: '700' },
  info: { fontSize: 14, color: '#555' },
});
