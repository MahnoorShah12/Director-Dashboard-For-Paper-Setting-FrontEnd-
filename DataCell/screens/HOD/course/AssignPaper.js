 import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { BASE_URL } from "../../../config/Api";

export default function AssignPaper({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ================= FETCH SESSIONS ================= */
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/session/get_all_sessions`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load sessions");
    }
  };

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    if (!selectedSession) {
      setCourses([]);
      setSelectedCourse(null);
      setSelectedTeacher(null);
      return;
    }

    fetchCourses();
  }, [selectedSession]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);

      const res = await fetch(
        `${BASE_URL}/AssignPaper/search?sessionId=${selectedSession}`
      );

      const data = await res.json();

      const formatted = data.map((c) => ({
        label: c.CourseName,
        value: c.CourseId,
        teachers: c.Teachers.map((t) => ({
          id: t.TeacherId,
          name: t.TeacherName,
          assigned: t.Assigned || false, // 👈 Add assigned flag
        })),
      }));

      setCourses(formatted);
      setSelectedCourse(null);
      setSelectedTeacher(null);
    } catch (err) {
      Alert.alert("Error", "Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  /* ================= ASSIGN PAPER ================= */
  const handleAssign = async () => {
    if (!selectedSession || !selectedCourse || !selectedTeacher) {
      setError("Please select session, course and teacher");
      setSuccess("");
      return;
    }

    try {
      setLoadingAssign(true);
      setError("");
      setSuccess("");

      const res = await fetch(`${BASE_URL}/AssignPaper/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          CourseId: selectedCourse.value,
          TeacherId: selectedTeacher,
          SessionId: selectedSession,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          data?.Message ||
          "This teacher is already assigned to this course. Please choose another.";
        Alert.alert("Notice", message);
        return;
      }

      setSuccess(data.Message || "Teacher assigned successfully!");
      // Refresh courses so assigned flag updates
      fetchCourses();
    } catch (err) {
      Alert.alert("Error", "Failed to assign paper. Please try again.");
    } finally {
      setLoadingAssign(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B8F5A" }}>
      {/* HEADER */}
      <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.back}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Assign  Paper</Text>
              <View style={{ width: 24 }} />
            </View>

      {/* BODY */}
      <ScrollView style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        {/* SESSION DROPDOWN */}
        <Text style={styles.sectionTitle}>Select Session</Text>
        <Dropdown
          style={styles.dropdown}
          data={sessions}
          labelField="name"
          valueField="id"
          placeholder="Select session"
          value={selectedSession}
          onChange={(item) => setSelectedSession(item.id)}
        />

        {/* COURSE DROPDOWN */}
        <Text style={styles.sectionTitle}>Select Course</Text>
        <Dropdown
          style={styles.dropdown}
          data={courses}
          labelField="label"
          valueField="value"
          placeholder={loadingCourses ? "Loading..." : "Select course"}
          value={selectedCourse?.value}
          onChange={(item) => {
            setSelectedCourse(item);
            setSelectedTeacher(null);
          }}
        />

        {/* COURSE NAME BOX */}
        {selectedCourse && (
          <>
            <Text style={styles.sectionTitle}>Course Name</Text>
            <View style={styles.courseBox}>
              <Text style={styles.courseText}>{selectedCourse.label}</Text>
            </View>
          </>
        )}

        {/* TEACHER RADIO LIST */}
        {selectedCourse && selectedCourse.teachers.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Select Teacher</Text>

            {selectedCourse.teachers.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.radioRow,
                  t.assigned && { opacity: 0.5 }, // 👈 disable look
                ]}
                onPress={() => !t.assigned && setSelectedTeacher(t.id)}
                disabled={t.assigned} // 👈 can't select already assigned
              >
                <View style={styles.radioOuter}>
                  {selectedTeacher === t.id && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.teacherName}>
                  {t.name} {t.assigned ? "(Already Assigned)" : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ASSIGN BUTTON */}
        <TouchableOpacity
          style={styles.assignButton}
          onPress={handleAssign}
          disabled={loadingAssign}
        >
          {loadingAssign ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.assignBtnText}>Assign</Text>
          )}
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#555",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  courseBox: {
    backgroundColor: "#EAEAEA",
    padding: 14,
    borderRadius: 14,
  },
  courseText: {
    fontSize: 15,
    color: "#333",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#0B8F5A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0B8F5A",
  },
  teacherName: {
    fontSize: 15,
  },
  assignButton: {
    backgroundColor: "#0B8F5A",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  assignBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  error: {
    backgroundColor: "#fdecea",
    color: "#b42318",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  success: {
    backgroundColor: "#e7f6ec",
    color: "#0f5132",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
}); 