import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../../../../config/Api";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
    if (!visible || !courseId || !selectedQuestionId) return;

    const fetchTeachersAndAssignment = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch teachers for this course
        const teachersRes = await axios.get(`${BASE_URL}/paper/get-teachers/${courseId}`);
        const teachersList = teachersRes.data || [];

        // 2️⃣ Fetch assigned editor for this question (Pre-selection logic)
        const assignmentRes = await axios.get(`${BASE_URL}/question/get_assigned_editor/${selectedQuestionId}`);
        const assignedTeacherId = assignmentRes.data?.editorId || null;

        setTeachers(teachersList);
        setSelectedTeacher(assignedTeacherId); 
      } catch (err) {
        console.error("Failed to fetch teachers or assigned editor", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachersAndAssignment();
  }, [visible, courseId, selectedQuestionId]);

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
      console.error("Assign failedToken", err);
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
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Select Teacher</Text>

            {loading ? (
              <View style={styles.centerSpace}>
                <ActivityIndicator size="large" color="#1976d2" />
                <Text style={styles.loadingText}>Loading teachers...</Text>
              </View>
            ) : teachers.length === 0 ? (
              <View style={styles.centerSpace}>
                <Text style={styles.noDataText}>No teachers found.</Text>
              </View>
            ) : (
              <ScrollView style={styles.teacherList} showsVerticalScrollIndicator={false}>
                {teachers.map((t) => {
                  const isSelected = selectedTeacher === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      activeOpacity={0.7}
                      style={[
                        styles.teacherCard,
                        isSelected ? styles.selectedCard : styles.unselectedCard
                      ]}
                      onPress={() => setSelectedTeacher(t.id)}
                    >
                      {/* Radio Circle */}
                      <View style={[styles.radioCircle, isSelected && styles.radioSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      
                      <Text style={[styles.teacherName, isSelected && styles.selectedText]}>
                        {t.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
                style={[styles.assignBtn, assigning && { opacity: 0.7 }]} 
                onPress={handleAssign}
                disabled={assigning}
            >
              <Text style={styles.assignBtnText}>
                {assigning ? "Assigning..." : "Assign"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
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
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    width: "90%",
    maxHeight: SCREEN_HEIGHT * 0.8,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  closeBtn: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
    color: "#000",
  },
  content: {
    padding: 22,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 15,
    color: "#000",
    marginBottom: 12,
  },
  centerSpace: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  noDataText: {
    color: "#666",
  },
  teacherList: {
    maxHeight: 250,
  },
  teacherCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  unselectedCard: {
    borderColor: "#dcdcdc",
    backgroundColor: "#ffffff",
  },
  selectedCard: {
    borderColor: "#1976d2",
    backgroundColor: "#f4f9ff",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#dcdcdc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioSelected: {
    borderColor: "#1976d2",
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#1976d2",
  },
  teacherName: {
    fontSize: 16,
    color: "#444",
  },
  selectedText: {
    color: "#000",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  assignBtn: {
    backgroundColor: "#1976d2",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginLeft: 10,
  },
  assignBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
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
    fontSize: 14,
  },
});