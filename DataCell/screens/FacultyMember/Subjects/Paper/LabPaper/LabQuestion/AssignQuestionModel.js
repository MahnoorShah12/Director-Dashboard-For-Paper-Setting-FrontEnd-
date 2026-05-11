import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import axios from "axios";
import { BASE_URL } from "../../../../../../config/Api";

const AssignQuestionModel = ({
  visible,
  paperId,
  selectedQuestionId,
  courseId,
  onClose,
}) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!courseId || !selectedQuestionId) return;

    const fetchTeachersAndAssignment = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch teachers for course
        const teachersRes = await axios.get(
          `${API_URL}paper/get-teachers/${courseId}`
        );

        const teachersList = teachersRes.data || [];

        // 2️⃣ Fetch already assigned editor
        const assignmentRes = await axios.get(
          `${BASE_URL}/question/get_assigned_editor/${selectedQuestionId}`
        );

        const assignedTeacherId =
          assignmentRes.data?.editorId || null;

        setTeachers(teachersList);
        setSelectedTeacher(assignedTeacherId);
      } catch (err) {
        console.log("Failed to fetch teachers or assigned editor", err);
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
        UserId: selectedTeacher,
      });

      Alert.alert("Success", "Question assigned successfully!");

      onClose();
    } catch (err) {
      console.log("Assign failed", err);
      Alert.alert("Error", "Failed to assign question.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Assign Question</Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>

            {/* 
            <View style={styles.infoBox}>
              <Text>Paper ID: {paperId}</Text>
              <Text>
                Question ID: {selectedQuestionId || "None"}
              </Text>
            </View>
            */}

            <Text style={styles.sectionTitle}>
              Select Teacher
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#1976d2" />
            ) : teachers.length === 0 ? (
              <Text style={styles.noDataText}>
                No teachers found.
              </Text>
            ) : (
              <ScrollView
                style={styles.teacherList}
                showsVerticalScrollIndicator={false}
              >
                {teachers.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.teacherCard,
                      selectedTeacher === t.id &&
                        styles.selectedTeacherCard,
                    ]}
                    onPress={() => setSelectedTeacher(t.id)}
                  >
                    {/* Radio Circle */}
                    <View
                      style={[
                        styles.radioOuter,
                        selectedTeacher === t.id &&
                          styles.radioOuterSelected,
                      ]}
                    >
                      {selectedTeacher === t.id && (
                        <View style={styles.radioInner} />
                      )}
                    </View>

                    <Text style={styles.teacherName}>
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>

            <TouchableOpacity
              style={[
                styles.assignBtn,
                assigning && { opacity: 0.7 },
              ]}
              disabled={assigning}
              onPress={handleAssign}
            >
              <Text style={styles.assignBtnText}>
                {assigning ? "Assigning..." : "Assign"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
            >
              <Text style={styles.cancelBtnText}>
                Cancel
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </View>
    </Modal>
  );
};

export default AssignQuestionModel;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },

  modalContainer: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },

  closeBtn: {
    fontSize: 22,
    color: "#000",
  },

  content: {
    padding: 22,
  },

  infoBox: {
    backgroundColor: "#f7f7f7",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },

  teacherList: {
    maxHeight: 250,
  },

  teacherCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  selectedTeacherCard: {
    borderWidth: 2,
    borderColor: "#1976d2",
    backgroundColor: "#f4f9ff",
  },

  teacherName: {
    marginLeft: 12,
    fontSize: 15,
    color: "#000",
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },

  radioOuterSelected: {
    borderColor: "#1976d2",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1976d2",
  },

  noDataText: {
    color: "#000",
    fontSize: 14,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  assignBtn: {
    backgroundColor: "#1976d2",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginRight: 10,
  },

  assignBtnText: {
    color: "#fff",
    fontWeight: "600",
  },

  cancelBtn: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },

  cancelBtnText: {
    color: "#000",
    fontWeight: "500",
  },
});