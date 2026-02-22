import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DashboardScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const storedName = await AsyncStorage.getItem('user_name');
      const storedRoles = await AsyncStorage.getItem('user_roles');

      // 🔐 Protection: agar login data nahi → Login
      if (!storedRoles) {
        navigation.replace('Login');
        return;
      }

      setName(storedName || '');
      setRoles(JSON.parse(storedRoles).map(r => r.toLowerCase()));
    };

    loadData();
  }, []);

  const logout = async () => {
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const Button = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      {/* ✅ Status Bar Green */}
      <StatusBar backgroundColor="#0B8F5A" barStyle="light-content" />

      <ScrollView>
        <View style={styles.container}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={styles.headerTitle}>Dashboard</Text>

            {/* LOGOUT ICON */}
            <TouchableOpacity onPress={logout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Welcome {name}</Text>

          {roles.includes('datacell') && (
            <>
              <Text style={styles.section}>DataCell Panel</Text>
              <Button title="Manage Faculty" onPress={() => navigation.navigate('Faculty')} />
              <Button title="Add Course" onPress={() => navigation.navigate('AddCourse')} />
              <Button title="Assign Course" onPress={() => navigation.navigate('AssignCourse')} />
              <Button title="Paper Verification" onPress={() => navigation.navigate('PaperVerification')} />
            </>
          )}

          {roles.includes('hod') && (
            <>
              <Text style={styles.section}>HOD Panel</Text>
              <Button title="View Faculty" onPress={() => navigation.navigate('ViewFaculty')} />
              <Button title="View Course" onPress={() => navigation.navigate('ViewCourse')} />
              <Button title="Assign Paper" onPress={() => navigation.navigate('AssignPaper')} />
              <Button title="Assign Course" />
            </>
          )}

          {roles.includes('director') && (
            <>
              <Text style={styles.section}>Director Panel</Text>
              <Button title="Current Papers" />
              <Button title="Past Papers" />
              <Button title="Paper Submission Plan " onPress={() => navigation.navigate('VettingAlerts')} />
              <Button title="Role Handover" onPress={() => navigation.navigate('DutySwitch')} />
            </>
          )}

          {roles.includes('faculty') && (
            <>
              <Text style={styles.section}>Faculty Panel</Text>
              <Button title="Object Oriented Programing " />
               <Button title="Data Structures " />
            </>
          )}

        </View>
      </ScrollView>
    </>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 20,
  },

  header: {
    backgroundColor: '#0B8F5A',
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#0B8F5A',
  },

  section: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },

  button: {
    backgroundColor: '#0B8F5A',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 12,
  },

  btnText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});
