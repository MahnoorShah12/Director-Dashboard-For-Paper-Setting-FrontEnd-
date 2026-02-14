import React, { useState } from 'react';
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

// ✅ Document Picker
import { pick, types, isCancel } from "@react-native-documents/picker";

const AssignCourse = ({ navigation }) => {
  const [showAddSession, setShowAddSession] = useState(false);

  const [session, setSession] = useState(null);
  const [sessionName, setSessionName] = useState('');

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const sessionData = [
    { label: 'Fall 2024', value: 'fall2024' },
    { label: 'Spring 2025', value: 'spring2025' },
  ];

  // ==========================
  // IMPORT HANDLER
  // ==========================
  const handleImport = async () => {
    try {
      const result = await pick({
        type: [types.xlsx, types.xls],
        allowMultiSelection: false,
      });

      const file = result[0];

      console.log("Picked file:", file);

      Alert.alert(
        "File Selected",
        `Name: ${file.name}\nSize: ${file.size} bytes`
      );

      // 👉 You can upload or parse XLS here
      // file.uri

    } catch (err) {
      if (isCancel(err)) {
        console.log("User cancelled document picker");
      } else {
        console.error("Document Picker Error:", err);
        Alert.alert("Error", "Unable to open document picker");
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
        <Text style={styles.headerTitle}>Course</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Assign Course</Text>

        {/* SESSION DROPDOWN */}
        <View style={styles.row}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={{ color: '#000' }}
            data={sessionData}
            labelField="label"
            valueField="value"
            placeholder="Select session"
            value={session}
            onChange={item => setSession(item.value)}
          />

          <TouchableOpacity
            style={styles.plusBtn}
            onPress={() => setShowAddSession(!showAddSession)}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ADD NEW SESSION */}
        {showAddSession && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add New Session</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={sessionName}
              onChangeText={setSessionName}
            />

            {/* START DATE */}
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateText}>
                {startDate ? startDate.toDateString() : 'Start Date'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color="#555" />
            </TouchableOpacity>

            {/* END DATE */}
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateText}>
                {endDate ? endDate.toDateString() : 'End Date'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color="#555" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.addBtn}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DATE PICKERS */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
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
            display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
            onChange={(e, date) => {
              setShowEndPicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}

        {/* IMPORT BUTTON */}
        <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
          <Text style={styles.importText}>Import</Text>
          <View style={styles.xlsTag}>
            <Text style={styles.xlsText}>XLS</Text>
          </View>
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