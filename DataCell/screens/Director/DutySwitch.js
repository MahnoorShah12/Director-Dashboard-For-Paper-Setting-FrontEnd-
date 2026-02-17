import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
 

import { BASE_URL } from "../../config/Api";
export default function DutySwitch({ navigation }) {
  const [teachers, setTeachers] = useState([]);
  const [currentDirector, setCurrentDirector] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH CURRENT DIRECTOR ================= */
  const fetchCurrentDirector = async () => {
    try {
      const res = await fetch(`${BASE_URL}/dutySwitch/current_director`);
      const data = await res.json();
      const temp = data.find((d) => d.IsTemporary === true);
      setCurrentDirector(temp || null);
    } catch (err) {
      Alert.alert("Error", "Failed to load current director");
    }
  };

  /* ================= FETCH TEACHERS ================= */
  const fetchTeachers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/dutySwitch/get_all_teachers`);
      const data = await res.json();
      setTeachers(data || []);
    } catch (err) {
      Alert.alert("Error", "Failed to load teachers");
    }
  };

  useEffect(() => {
    fetchCurrentDirector();
    fetchTeachers();
  }, []);

  /* ================= ASSIGN TEMP DIRECTOR ================= */
  const assignTemporaryDirector = async () => {
    if (!selectedTeacher) {
      Alert.alert("Warning", "Please select a teacher first");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/dutySwitch/assign_temporary_director/${selectedTeacher}`,
        { method: "POST" }
      );

      if (!res.ok) {
        Alert.alert("Error", "Failed to assign");
        return;
      }

      Alert.alert("Success", "Temporary director assigned");
      fetchCurrentDirector();
      fetchTeachers();
      setSelectedTeacher(null);
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESTORE DUTIES ================= */
  const restoreMyDuties = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/dutySwitch/ReStore_All_My_Responsiables`,
        { method: "POST" }
      );

      if (!res.ok) {
        Alert.alert("Error", "Failed to restore duties");
        return;
      }

      Alert.alert("Success", "Director duties restored");
      fetchCurrentDirector();
      fetchTeachers();
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B8F5A" }}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Role Handover</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* BODY */}
      <ScrollView style={styles.body}>

        {/* ACTIVE STATUS */}
        {!currentDirector && (
          <View style={styles.activeBox}>
            <Text style={styles.activeTitle}>You are Active Director</Text>
            <Text style={styles.activeSub}>
              You are handling all director responsibilities
            </Text>
          </View>
        )}

        {/* TEMP ASSIGNED BOX */}
        {currentDirector && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Duty Currently Assigned</Text>
            <Text style={styles.warningSub}>
              All responsibilities assigned to {currentDirector.name}
            </Text>
          </View>
        )}

        {/* SELECT TEACHER CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Teacher to Assign</Text>

          {teachers.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.teacherRow,
                t.IsTemporary && { opacity: 0.5 },
              ]}
              onPress={() => !t.IsTemporary && setSelectedTeacher(t.id)}
              disabled={t.IsTemporary}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {t.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <Text style={styles.teacherName}>{t.name}</Text>

              <View style={styles.radioOuter}>
                {selectedTeacher === t.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* BUTTONS */}
        <TouchableOpacity
          style={styles.assignButton}
          onPress={assignTemporaryDirector}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Assign Temporary Director</Text>
          )}
        </TouchableOpacity>

        {currentDirector && (
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={restoreMyDuties}
            disabled={loading}
          >
            <Text style={styles.restoreText}>Restore My Director Duties</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({

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

  body: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },

  activeBox: {
    backgroundColor: "#E7F6EC",
    borderColor: "#0B8F5A",
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginBottom: 20,
  },

  activeTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0B8F5A",
  },

  activeSub: {
    marginTop: 4,
    color: "#0B8F5A",
  },

  warningBox: {
    backgroundColor: "#FFF4E5",
    borderColor: "#FFA500",
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginBottom: 20,
  },

  warningTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#CC8400",
  },

  warningSub: {
    marginTop: 4,
    color: "#CC8400",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 15,
    marginBottom: 20,
  },

  sectionTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 15,
  },

  teacherRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#CDEEDD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontWeight: "700",
    color: "#0B8F5A",
    fontSize: 16,
  },

  teacherName: {
    flex: 1,
    fontSize: 15,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#0B8F5A",
    justifyContent: "center",
    alignItems: "center",
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0B8F5A",
  },

  assignButton: {
    backgroundColor: "#0B8F5A",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 15,
  },

  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  restoreButton: {
    alignItems: "center",
    padding: 12,
  },

  restoreText: {
    color: "#0B8F5A",
    fontWeight: "600",
  },
});
