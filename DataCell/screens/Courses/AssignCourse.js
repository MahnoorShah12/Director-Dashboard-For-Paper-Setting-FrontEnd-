import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { pick, types, isCancel } from "@react-native-documents/picker";

const BASE_URL = "http://192.168.137.1/fypProject/api"; // ⚠️ apna IP lagana

const AssignCourse = ({ navigation }) => {

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ================= FETCH SESSIONS ================= */
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/session/get_all_sessions`);
      setSessions(res.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load sessions");
    }
  };

  /* ================= ADD SESSION ================= */
  const handleAddSession = async () => {

    if (!sessionName || !startDate || !endDate) {
      Alert.alert("Error", "All fields required");
      return;
    }

    if (startDate > endDate) {
      Alert.alert("Error", "Start date cannot be after end date");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${BASE_URL}/session/add_session`, {
        name: sessionName,
        start_date: startDate,
        end_date: endDate
      });

      Alert.alert("Success", "Session added successfully");

      setSessionName('');
      setStartDate(null);
      setEndDate(null);
      setShowAddSession(false);

      fetchSessions(); // refresh dropdown
    }
    catch (err) {
      Alert.alert("Error", err.response?.data || "Failed to add session");
    }
    finally {
      setLoading(false);
    }
  };

  /* ================= IMPORT EXCEL ================= */
  const handleImport = async () => {

    if (!selectedSession) {
      Alert.alert("Error", "Please select session first");
      return;
    }

    try {
      const result = await pick({
        type: [types.xlsx, types.xls],
      });

      const file = result[0];

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });

      const response = await axios.post(
        `${BASE_URL}/excel/upload?sessionId=${selectedSession}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      Alert.alert("Success", response.data);
    }
    catch (err) {
      if (!isCancel(err)) {
        Alert.alert("Error", "Excel upload failed");
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0B8F5A" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Course</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* SESSION DROPDOWN */}
        <View style={styles.row}>
          <Dropdown
            style={styles.dropdown}
            data={sessions}
            labelField="name"
            valueField="id"
            placeholder="Select session"
            value={selectedSession}
            onChange={item => setSelectedSession(item.id)}
          />

          <TouchableOpacity
            style={styles.plusBtn}
            onPress={() => setShowAddSession(!showAddSession)}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ADD SESSION */}
        {showAddSession && (
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Session Name"
              value={sessionName}
              onChangeText={setSessionName}
            />

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Text>
                {startDate ? startDate.toDateString() : "Start Date"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Text>
                {endDate ? endDate.toDateString() : "End Date"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addBtn} onPress={handleAddSession}>
              <Text style={{ color: "#fff" }}>
                {loading ? "Adding..." : "Add"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DATE PICKERS */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            onChange={(e, date) => {
              setShowStartPicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            onChange={(e, date) => {
              setShowEndPicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}

        {/* IMPORT BUTTON */}
        <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Import XLS</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default AssignCourse;


// ==========================
// STYLES
// ==========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F3F6',
  },

  header: {
    height: 75,
    backgroundColor: '#0B8F5A',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },

  content: {
    padding: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B8F5A',
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  dropdown: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  dropdownText: {
    color: '#999',
  },

  plusBtn: {
    marginLeft: 10,
    backgroundColor: '#0B8F5A',
    height: 48,
    width: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DFF3EA',
  },
  cardTitle: {
    color: '#0B8F5A',
    fontWeight: '700',
    marginBottom: 12,
  },

  input: {
    backgroundColor: '#F3F5F7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  dateInput: {
    backgroundColor: '#F3F5F7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: '#999',
  },

  addBtn: {
    backgroundColor: '#0B8F5A',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  importBtn: {
    backgroundColor: '#0B8F5A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  importText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  xlsTag: {
    backgroundColor: '#F9B233',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  xlsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});