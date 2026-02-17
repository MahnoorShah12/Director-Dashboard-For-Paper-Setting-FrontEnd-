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
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../config/Api';


const FacultyScreen = ({ navigation }) => {
  const [facultyList, setFacultyList] = useState([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
 

  //  const BASE_URL = 'http://192.168.137.1/fypProject/api/faculty';

  /* ================= FETCH ================= */
  const fetchFaculty = async (search = '') => {
    try {
      const url = search
        ? `${BASE_URL}/faculty/search_teacher?search=${encodeURIComponent(search)}`
        : `${BASE_URL}/faculty/get_teachers?page=1&pageSize=1000`;

      const res = await fetch(url);
      const json = await res.json();

      setFacultyList(Array.isArray(json) ? json : json.data || []);
    } catch {
      Alert.alert('Error', 'Server not reachable');
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    fetchFaculty(searchTerm);
  }, [searchTerm]);

  /* ================= ADD ================= */
  const handleAddFaculty = async () => {
    if (!name || !email || !username || !password || password !== confirmPassword) {
      Alert.alert('Error', 'Please fill all fields correctly');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/faculty/add-teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, username, password }),
      });

      const msg = await res.text();

      if (res.ok) {
        Alert.alert('Success', msg || 'Faculty added');
        fetchFaculty(searchTerm);

        setName('');
        setEmail('');
        setPhone('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', msg);
      }
    } catch {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    Alert.alert(
      'Delete Faculty',
      'Are you sure you want to delete this faculty member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(
                `${BASE_URL}/faculty/delete_teacher/${id}`,
                { method: 'POST' }
              );

              const msg = await res.text();

              if (res.ok) {
                Alert.alert('Success', msg);
                fetchFaculty(searchTerm);
              } else {
                Alert.alert('Error', msg);
              }
            } catch {
              Alert.alert('Error', 'Server not responding');
            }
          },
        },
      ]
    );
  };

  /* ================= CARD ================= */
  const renderFaculty = ({ item }) => {
    const id = item.id || item.Id;

    return (
      <View style={styles.facultyCard}>
        <Text style={styles.name}>{item.name || item.Name}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={16} color="#070707" />
          <Text style={styles.infoText}>{item.email || item.Email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#0a0b0a" />
          <Text style={styles.infoText}>
            {item.phone_no || item.Phone || 'N/A'}
          </Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditFaculty', { faculty: item })}
          >
            <Ionicons name="create-outline" size={18} color="#0b0c0c" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(id)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F1F3F6' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar backgroundColor="#0B8F5A" barStyle="light-content" />

      <FlatList
        data={facultyList}
        keyExtractor={(item, index) => `${item.Id || item.id}-${index}`}
        renderItem={renderFaculty}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListHeaderComponent={
          <>
            {/* HEADER */}
             {/* HEADER */}
             <View>
     <View style={styles.container}>
 {/* HEADER CARD */}
<View style={styles.headerWrapper}>
  <View style={styles.headerCard}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Ionicons name="chevron-back" size={26} color="#fff" />
    </TouchableOpacity>

    <Text style={styles.headerTitle}>Faculty Members</Text>

    <View style={{ width: 26 }} />
  </View>
</View>

      </View>

  {/* right side empty for symmetry */}
  <View style={{ width: 40}} />
</View>

           
            {/* ADD FACULTY */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Add New Faculty</Text>

              {[
                { icon: 'person-outline', placeholder: 'Name', value: name, set: setName },
                { icon: 'mail-outline', placeholder: 'Email', value: email, set: setEmail },
                { icon: 'call-outline', placeholder: 'Phone', value: phone, set: setPhone },
                { icon: 'person-circle-outline', placeholder: 'Username', value: username, set: setUsername },
                { icon: 'lock-closed-outline', placeholder: 'Password', value: password, set: setPassword, secure: true },
                { icon: 'shield-checkmark-outline', placeholder: 'Confirm Password', value: confirmPassword, set: setConfirmPassword, secure: true },
              ].map((f, i) => (
                <View style={styles.addInputRow} key={i}>
                  <Ionicons name={f.icon} size={18} color="#121312" />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                     placeholderTextColor="#999"
                    value={f.value}
                    secureTextEntry={f.secure}
                    onChangeText={f.set}
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.addBtn} onPress={handleAddFaculty}>
                <Text style={styles.addBtnText}>Add Faculty Member</Text>
              </TouchableOpacity>
            </View>

            {/* SEARCH */}
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={18} color="#777" />
              <TextInput
                style={styles.input}
                placeholder="Search by name, email or phone..."
                 placeholderTextColor="#999"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
          </>
        }
      />
    </KeyboardAvoidingView>
  );
};

export default FacultyScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  headerWrapper: {
  backgroundColor: '#F1F3F6',   // screen bg
  paddingHorizontal: 12,
  paddingTop: 12,
  marginBottom: 10,
},

headerCard: {
  height: 75,
  backgroundColor: '#0B8F5A',
  borderRadius: 18,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,

  // shadow (Android)
  elevation: 6,

  // shadow (iOS)
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
},

headerTitle: {
  flex: 1,
  textAlign: 'center',
  color: '#fff',
  fontSize: 20,
  fontWeight: '600',
},

  header: {
  height: 90,
  backgroundColor: '#0B8F5A',
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: 35,   // status bar space
 
  paddingHorizontal: 30,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
},




  backBtn: { color: '#fff', fontSize: 16, fontWeight: '600' },
 
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0B8F5A', marginBottom: 12 },

  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },

  input: { flex: 1, paddingVertical: 14, marginLeft: 8 },

  addBtn: {
    backgroundColor: '#0B8F5A',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700' },

  facultyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: '700' },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  infoText: { marginLeft: 8, color: '#555' },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

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
