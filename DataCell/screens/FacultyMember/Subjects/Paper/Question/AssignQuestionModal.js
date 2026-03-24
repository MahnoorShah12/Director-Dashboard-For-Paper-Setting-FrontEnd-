import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../../../../config/Api";
export default function AssignQuestionModal({
  visible,
  paperId,
  selectedQuestionId,
  courseId,
  onClose
}) {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!courseId || !selectedQuestionId) return;

    const fetchTeachersAndAssignment = async () => {
      try {
        setLoading(true);

        // fetch teachers
        const teachersRes = await axios.get(
          `${BASE_URL}/paper/get-teachers/${courseId}`
        );

        const teachersList = teachersRes.data || [];

        // fetch assigned teacher
        const assignmentRes = await axios.get(
          `${BASE_URL}/question/get_assigned_editor/${selectedQuestionId}`
        );

        const assignedTeacherId = assignmentRes.data?.editorId || null;

        setTeachers(teachersList);
        setSelectedTeacher(assignedTeacherId);
      } catch (err) {
        console.log("Teacher fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachersAndAssignment();
  }, [courseId, selectedQuestionId]);

  const handleAssign = async () => {
    if (!selectedQuestionId) {
      Alert.alert("Error", "No question selected.");
      return;
    }

    if (!selectedTeacher) {
      Alert.alert("Error", "Please select a teacher.");
      return;
    }

    try {
      setAssigning(true);

      await axios.post(`${BASE_URL}/question/assign_editor`, {
        QuestionId: selectedQuestionId,
        UserId: selectedTeacher
      });

      Alert.alert("Success", "Question assigned successfully!");
      onClose();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to assign question.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>

        <View style={styles.modal}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Assign Question</Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>

            <Text style={styles.sectionTitle}>Select Teacher</Text>

            {loading ? (
              <ActivityIndicator size="large" />
            ) : teachers.length === 0 ? (
              <Text>No teachers found.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 250 }}>
                {teachers.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.teacherCard,
                      selectedTeacher === t.id && styles.selectedCard
                    ]}
                    onPress={() => setSelectedTeacher(t.id)}
                  >
                    <Text style={styles.teacherName}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.assignBtn}
              onPress={handleAssign}
              disabled={assigning}
            >
              <Text style={styles.assignText}>
                {assigning ? "Assigning..." : "Assign"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingBottom: 10
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },

  title: {
    fontSize: 18,
    fontWeight: "bold"
  },

  close: {
    fontSize: 22
  },

  content: {
    padding: 16
  },

  sectionTitle: {
    fontWeight: "600",
    marginBottom: 10
  },

  teacherCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10
  },

  selectedCard: {
    borderColor: "#1976d2",
    backgroundColor: "#eef5ff"
  },

  teacherName: {
    fontSize: 16
  },

  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16
  },

  assignBtn: {
    backgroundColor: "#1976d2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10
  },

  assignText: {
    color: "#fff",
    fontWeight: "bold"
  },

  cancelBtn: {
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  }
});