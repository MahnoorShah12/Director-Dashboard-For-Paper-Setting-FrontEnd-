import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "../../config/Api";

const MySubjects = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params || {};

  const [name, setName] = useState("Guest");
  const [roles, setRoles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createPaper, setCreatePaper] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const storedUserId = await AsyncStorage.getItem("user_id");
      const storedName = await AsyncStorage.getItem("user_name");
      const storedRoles = JSON.parse(await AsyncStorage.getItem("user_roles") || "[]");

      if (!storedRoles || storedRoles.length === 0) {
        navigation.replace("Login");
        return;
      }

      setName(storedName || "Guest");
      const normalizedRoles = storedRoles.map((r) => r.toLowerCase());
      setRoles(normalizedRoles);
      setUserId(storedUserId);

      fetchCourseForUser(storedUserId, courseId);
    };

    loadData();
  }, [courseId]);

  const fetchCourseForUser = async (userId, courseId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/paper/verify-teacher-teach-course/${userId}?courseId=${courseId}`
      );

      const assignedCourse = response.data.Course;
      setCreatePaper(response.data.CreatePaper);

      if (assignedCourse) {
        setCourse(assignedCourse);
      } else {
        navigation.replace("Unauthorized"); // Navigate if course not assigned
      }
    } catch (error) {
      console.error("Error verifying course:", error);
      navigation.replace("Error");
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = (courseId) => {
    setSelectedCourseId(courseId);
    setShowTermModal(true);
  };

  const Card = ({ title, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading course details...</Text>
        <ActivityIndicator size="large" color="#0aa36c" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenHeading}>Course Detail</Text>
      {course ? (
         
        <View style={styles.courseDetails}>
          <Text style={styles.courseTitle}>{course.CourseTitle}</Text>
          <Text style={styles.courseCode}>Course Code: {course.CourseCode}</Text>

          <Text style={styles.sectionTitle}>Course Panel</Text>
          <View style={styles.cardGrid}>
            {createPaper ? (
              <Card title="Create Paper" onPress={() => handlePaperClick(course.CourseId)} />
            ) : (
              <Card title="View  Paper" onPress={() => handlePaperClick(course.CourseId)} />
            )}
            <Card
              title="View Topics"
              onPress={() => navigation.navigate("ViewTopics", { courseId: course.CourseId })}
            />
            <Card
              title="View CLOs"
              onPress={() => navigation.navigate("ViewCLOs", { courseId: course.CourseId })}
            />
          </View>
        </View>
      ) : (
        <View style={styles.unauthorizedMessage}>
          <Text>You are not assigned to this course.</Text>
        </View>
      )}

      {/* Term Selection Modal */}
      <Modal transparent visible={showTermModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Term</Text>
            <Text style={styles.modalText}>Which term do you want to access?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.termBtn}
                onPress={() => {
                  setShowTermModal(false);
                  navigation.navigate("CreatePaper", { courseId: selectedCourseId, term: "Mid" });
                }}
              >
                <Text style={styles.termBtnText}>Mid Term</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.termBtn}
                onPress={() => {
                  setShowTermModal(false);
                  navigation.navigate("CreatePaper", { courseId: selectedCourseId, term: "Final" });
                }}
              >
                <Text style={styles.termBtnText}>Final Term</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowTermModal(false)}
            >
              <Text style={{ fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default MySubjects;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6fff6",
    padding: 20,
  },
  screenHeading: {
  fontSize: 24,
  fontWeight: "700",
  color: "#0aa36c",
  textAlign: "center",
  marginTop: 10,
  marginBottom: 15,
},
  loadingText: {
    marginTop: 100,
    textAlign: "center",
    fontSize: 18,
    color: "#0aa36c",
    fontWeight: "500",
  },
  courseDetails: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 25,
    marginTop: 20,
    borderLeftWidth: 6,
    borderLeftColor: "#0aa36c",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0aa36c",
    marginBottom: 10,
  },
  courseCode: {
    fontSize: 16,
    color: "#444",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    width: "48%",
    borderLeftWidth: 5,
    borderLeftColor: "#0aa36c",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  unauthorizedMessage: {
    marginTop: 40,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    color: "#d9534f",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    color: "#0aa36c",
    fontWeight: "600",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  termBtn: {
    backgroundColor: "#0aa36c",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  termBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalClose: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});