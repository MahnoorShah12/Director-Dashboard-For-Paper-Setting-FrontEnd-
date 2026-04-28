

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../config/Api";
import { useRoute, useNavigation } from "@react-navigation/native";

const PastPaperView = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { paper } = route.params || {};
  const PaperId = paper?.PaperId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===== FETCH PAPER DETAILS =====
  const fetchPaperDetails = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/paper/GetPaperDetails/${PaperId}`
      );

      setData(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch paper details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (PaperId) fetchPaperDetails();
  }, [PaperId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading paper details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No paper found</Text>
      </View>
    );
  }

  const baseUrl = "https://localhost:44304/";

  return (
    <ScrollView style={styles.container}>

      {/* ===== BACK BUTTON ===== */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Text style={{ color: "#fff" }}>⬅ Back</Text>
      </TouchableOpacity>

      {/* ===== TITLE ===== */}
      <Text style={styles.title}>
        {data.CourseTitle} ({data.CourseCode})
      </Text>

      {/* ===== INFO BOXES ===== */}
      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text>Session</Text>
          <Text style={styles.bold}>{data.SessionName}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text>Term</Text>
          <Text style={styles.bold}>{data.Term}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text>Teacher</Text>
          <Text style={styles.bold}>{data.TeacherName}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text>Status</Text>
          <Text style={styles.bold}>{data.PaperStatus}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text>Total Marks</Text>
          <Text style={styles.bold}>{data.TotalMarks}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text>Questions</Text>
          <Text style={styles.bold}>{data.NoOfQuestions}</Text>
        </View>
      </View>

      {/* ===== QUESTIONS ===== */}
      <Text style={styles.subTitle}>Questions</Text>

      {data.Questions?.length === 0 ? (
        <Text style={styles.emptyText}>No questions found</Text>
      ) : (
        data.Questions.map((q, index) => (
          <View key={q.Id || index} style={styles.card}>

            {/* EXTRA TAG */}
            {q.IsExtra && (
              <View style={styles.extraTag}>
                <Text style={{ color: "#fff", fontSize: 10 }}>Extra</Text>
              </View>
            )}

            {/* QUESTION TEXT */}
            <Text style={styles.questionText}>
              {q.Text || "No question text provided"}
            </Text>

            {/* META */}
            <View style={styles.metaRow}>
              <Text style={styles.metaBadge}>CLO: {q.CloId}</Text>
              <Text style={styles.meta}>Marks: {q.Marks}</Text>
              <Text style={styles.meta}>
                Difficulty: {q.DifficultyLevel}
              </Text>
            </View>

            {/* IMAGE */}
            {q.Image ? (
              <Image
                source={{ uri: `${baseUrl}${q.Image}` }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default PastPaperView;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    padding: 12,
  },

  backBtn: {
    backgroundColor: "#059669",
    padding: 10,
    borderRadius: 10,
    width: 80,
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#1f2937",
  },

  subTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#059669",
    paddingLeft: 10,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },

  infoBox: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    elevation: 2,
  },

  bold: {
    fontWeight: "bold",
    marginTop: 5,
    color: "#047857",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#059669",
    position: "relative",
  },

  extraTag: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "#059669",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  questionText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  meta: {
    fontSize: 12,
    color: "#6b7280",
  },

  metaBadge: {
    fontSize: 12,
    color: "#047857",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#047857",
  },

  errorText: {
    color: "red",
  },

  emptyText: {
    color: "#6b7280",
  },
});
