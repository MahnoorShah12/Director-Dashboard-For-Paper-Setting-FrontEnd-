import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, API } from '../config/Api';


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email and password are required');
      return;
    }

    try {
       const response = await fetch(
        `${BASE_URL}${API.login}`,
       
      //   // `${BASE_URL}/auth/login`,
      //    'http://192.168.137.1/fypProject/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            Email: email,
            Password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const { user, roles, token } = data;

        await AsyncStorage.setItem('user_name', user.name);
        await AsyncStorage.setItem('user_roles', JSON.stringify(roles));
        if (token) {
          await AsyncStorage.setItem('token', token);
        }

        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch {
      Alert.alert('Error', 'Server not reachable');
    }
  };

  return (
    <View style={styles.container}>
      {/* TOP GREEN SECTION */}
      <View style={styles.topSection}>
        <View style={styles.logoBox}>
          <Image
            source={require('../assets/biit_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.headerText}>
          Director Dashboard for Paper Setting
        </Text>
      </View>

      {/* WHITE CARD */}
      <View style={styles.card}>
        <Text style={styles.welcome}>Welcome</Text>
        <Text style={styles.subText}>Login to access the dashboard</Text>

        {/* EMAIL */}
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color="#0c0d0d" />
          <TextInput
            style={styles.input}
            placeholder="youremail@biit.edu.pk"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* PASSWORD */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color="#0c0c0c" />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* FORGOTTEN PASSWORD */}
        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgotten password?</Text>
        </TouchableOpacity>

        {/* LOGIN BUTTON */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B8F5A',
  },

  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoBox: {
    width: 90,
    height: 90,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  logo: {
    width: 60,
    height: 60,
  },

  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  card: {
    flex: 1.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },

  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B8F5A',
  },

  subText: {
    color: '#777',
    marginBottom: 25,
  },

  label: {
    color: '#555',
    fontWeight: '600',
    marginBottom: 6,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7F8',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 52,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },

  forgotText: {
    color: '#0B8F5A',
    fontWeight: '600',
    marginBottom: 25,
  },

  loginBtn: {
    backgroundColor: '#0B8F5A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
