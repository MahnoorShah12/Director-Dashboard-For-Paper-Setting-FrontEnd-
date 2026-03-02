import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../../config/Api";

const SubjectClo = ({ route }) => {
  const { courseId } = route.params;

  const [clos, setClos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");

  const userId = "1"; // dummy userId for API

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/course/get_course_details/${courseId}`);
        setCourseName(response.data.title);
        setCourseCode(response.data.course_code);
      } catch (err) {
        console.error("Failed to fetch course details:", err);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // Fetch CLOs
  useEffect(() => {
    const fetchCLOs = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/clos/get_Clos/${courseId}`);
        setClos(response.data);
      } catch (err) {
        console.error("Failed to fetch CLOs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCLOs();
  }, [courseId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a8f5a" />
        <Text style={styles.loadingText}>Loading CLOs...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.courseTitle}>{courseName}</Text>
        <Text style={styles.courseCode}>Course Code: {courseCode}</Text>
      </View>

      <View style={styles.cloContainer}>
        {clos.length === 0 ? (
          <Text style={styles.emptyText}>No CLOs found for this course.</Text>
        ) : (
          clos.map((clo, index) => (
            <View key={clo.id} style={styles.cloCard}>
              <View style={styles.cloTag}>
                <Text style={styles.cloTagText}>CLO-{index + 1}</Text>
              </View>
              <Text style={styles.cloDesc}>{clo.description}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default SubjectClo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#0a8f5a",
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0a8f5a",
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  cloContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 10,
    gap: 12,
  },
  cloCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7f4ef",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#b7e4d4",
  },
  cloTag: {
    backgroundColor: "#0a8f5a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cloTagText: {
    color: "#fff",
    fontWeight: "600",
  },
  cloDesc: {
    flex: 1,
    fontSize: 15,
    color: "#1f1f1f",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },
});