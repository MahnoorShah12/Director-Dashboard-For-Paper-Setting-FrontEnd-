import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import { BASE_URL } from "../../../config/Api";

const SubjectTopic = ({ route }) => {
  const { courseId } = route.params;

  const [userId, setUserId] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [commonTopics, setCommonTopics] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [activeTab, setActiveTab] = useState("covered");
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(null);

  // ✅ Load userId from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      const id = await AsyncStorage.getItem("user_id");
      if (!id) {
        setAllowed(false);
        setLoading(false);
        return;
      }
      setUserId(id);
    };
    loadUser();
  }, []);

  // ✅ Check if teacher is assigned to course
  useEffect(() => {
    if (!userId || !courseId) return;

    axios
      .get(`${BASE_URL}/course/isTeacherAssigned`, {
        params: { course_id: courseId, user_id: userId },
      })
      .then((res) => setAllowed(res.data))
      .catch(() => setAllowed(false))
      .finally(() => setLoading(false));
  }, [userId, courseId]);

  // ✅ Fetch course details
  useEffect(() => {
    if (!allowed || !courseId) return;

    axios
      .get(`${BASE_URL}/course/get_course_details/${courseId}`)
      .then((res) => {
        setCourseName(res.data.title);
        setCourseCode(res.data.course_code);
      })
      .catch((err) => console.log("Course detail error:", err));
  }, [allowed, courseId]);

  // ✅ Fetch sections
  useEffect(() => {
    if (!allowed || !userId || !courseId) return;

    axios
      .get(`${BASE_URL}/course/get_teacher_sections`, {
        params: { course_id: courseId, user_id: userId },
      })
      .then((res) => {
        setSections(res.data || []);
        if (res.data?.length > 0) setSelectedSection(res.data[0].id);
      })
      .catch((err) => console.log("Sections error:", err));
  }, [allowed, userId, courseId]);

  // ✅ Fetch all topics
  useEffect(() => {
    if (!allowed || !courseId) return;

    axios
      .get(`${BASE_URL}/Topics/get_Topics/${courseId}`)
      .then((res) => setTopics(res.data || []))
      .catch((err) => console.log("Topics error:", err));
  }, [allowed, courseId]);

  // ✅ Fetch assigned topics
  useEffect(() => {
    if (!allowed || !selectedSection || !userId) return;

    setLoading(true);
    axios
      .get(`${BASE_URL}/Topics/getAssignedTopics`, {
        params: {
          section_id: selectedSection,
          course_id: courseId,
          user_id: userId,
        },
      })
      .then((res) => setSelectedTopics(res.data || []))
      .catch(() => setSelectedTopics([]))
      .finally(() => setLoading(false));
  }, [allowed, selectedSection, userId]);

  // ✅ Fetch common topics on tab change
  const fetchCommonTopics = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/Topics/getCommonTopics/${courseId}`);
      setCommonTopics(res.data || []);
    } catch {
      setCommonTopics([]);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "common") fetchCommonTopics();
  };

  // ✅ Toggle covered topic
  const handleTopicChange = async (topicId, checked) => {
    if (!selectedSection || activeTab !== "covered") return;

    try {
      if (checked) {
        await axios.post(`${BASE_URL}/Topics/topicteach`, {
          section_id: selectedSection,
          course_id: courseId,
          user_id: userId,
          topic_id: topicId,
        });
        setSelectedTopics([...selectedTopics, topicId]);
      } else {
        await axios.post(`${BASE_URL}/Topics/removeTopicTeach`, {
          section_id: selectedSection,
          course_id: courseId,
          user_id: userId,
          topic_id: topicId,
        });
        setSelectedTopics(selectedTopics.filter((id) => id !== topicId));
      }
    } catch (error) {
      console.log("Error updating topic:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a8f5a" />
        <Text style={styles.loadingText}>Loading Topics...</Text>
      </View>
    );
  }

  if (allowed === false) {
    return (
      <View style={styles.unauthorized}>
        <Text style={{ color: "red", fontSize: 16 }}>
          You are not assigned to this course.
        </Text>
      </View>
    );
  }

  const displayedTopics = activeTab === "covered" ? topics : commonTopics;

  return (
    <ScrollView style={styles.container}>
       {/* <View style={styles.container}> */}
            <View style={styles.header1}>
              <Text style={styles.headerTitle}>Topics</Text>
            </View>
      
      <View style={styles.header}>
        <Text style={styles.courseTitle}>{courseName}</Text>
        <Text style={styles.courseCode}>Course Code: {courseCode}</Text>
      </View>

      {/* Section Dropdown */}
      <View style={styles.sectionContainer}>
        <Text style={styles.label}>Select Section</Text>
        <Dropdown
          style={styles.dropdown}
          data={sections.map((sec) => ({
            label: `Section ${sec.name}`,
            value: sec.id,
          }))}
          labelField="label"
          valueField="value"
          value={selectedSection}
          placeholder="Select Section"
          onChange={(item) => setSelectedSection(item.value)}
        />
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "covered" && styles.activeTab]}
          onPress={() => handleTabChange("covered")}
        >
          <Text style={[styles.tabText, activeTab === "covered" && styles.activeTabText]}>
            Covered Topics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "common" && styles.activeTab]}
          onPress={() => handleTabChange("common")}
        >
          <Text style={[styles.tabText, activeTab === "common" && styles.activeTabText]}>
            Common Topics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Topics List */}
      <FlatList
        data={displayedTopics}
        // keyExtractor={(item) => item.id.toString()}
        keyExtractor={(item) =>
  activeTab === "common"
    ? item.toString()
    : item.id.toString()
}
        scrollEnabled={false}
        style={{ paddingHorizontal: 20, paddingBottom: 40 }}
      //   renderItem={({ item, index }) => {
      //     const isChecked =
      //       activeTab === "covered" ? selectedTopics.includes(item.id) : commonTopics.includes(item.id);

      //     return (
      //       <TouchableOpacity
      //         style={[styles.topicCard, isChecked && styles.checkedCard]}
      //         onPress={() => {
      //           if (activeTab === "covered") handleTopicChange(item.id, !isChecked);
      //         }}
      //       >
      //         <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
      //           {isChecked && <Text style={styles.checkmark}>✓</Text>}
      //         </View>
      //         <Text style={styles.topicText}>
      //           Topic {index + 1}: {item.description || item.title}
      //         </Text>
      //       </TouchableOpacity>
      //     );
      //   }}
      // />
      renderItem={({ item, index }) => {

  const topicId = activeTab === "common" ? item : item.id;

  const topicObj =
    activeTab === "common"
      ? topics.find((t) => t.id === topicId)
      : item;

  const isChecked =
    activeTab === "covered"
      ? selectedTopics.includes(topicId)
      : commonTopics.includes(topicId);

  return (
    <TouchableOpacity
      style={[styles.topicCard, isChecked && styles.checkedCard]}
      onPress={() => {
        if (activeTab === "covered")
          handleTopicChange(topicId, !isChecked);
      }}
    >
      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
        {isChecked && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <Text style={styles.topicText}>
        Topic {index + 1}:{" "}
        {topicObj?.description || topicObj?.title || "No Description"}
      </Text>
    </TouchableOpacity>
  );
}}/>
    </ScrollView>
  );
};

export default SubjectTopic;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f9f7" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#0a8f5a", fontSize: 16 },
  header: { padding: 20 },
  header1:{backgroundColor:"#0f9d58",padding:16,paddingTop:40,borderBottomLeftRadius:18,borderBottomRightRadius:18},
headerTitle:{color:"#fff",fontSize:30,fontWeight:"bold",textAlign:"center"},
  courseTitle: { fontSize: 22, fontWeight: "700", color: "#0a8f5a" },
  courseCode: { fontSize: 15, color: "#333", marginTop: 4 },
  sectionContainer: { paddingHorizontal: 20, marginBottom: 20 },
  label: { fontWeight: "600", marginBottom: 6, color: "#333" },
  dropdown: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cce5dc",
    paddingHorizontal: 10,
    marginTop: 5,
  },
  tabs: { flexDirection: "row", marginHorizontal: 20, marginBottom: 15 },
  tabBtn: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: "#e7f4ef",
    marginRight: 5,
  },
  activeTab: { backgroundColor: "#0a8f5a" },
  tabText: { fontWeight: "600", color: "#0a8f5a" },
  activeTabText: { color: "#fff" },
  topicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d7ebe4",
    marginBottom: 10,
  },
  checkedCard: { backgroundColor: "#e7f4ef", borderColor: "#0a8f5a" },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#bbb",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: "#0a8f5a", borderColor: "#0a8f5a" },
  checkmark: { color: "#fff", fontWeight: "bold" },
  topicText: { flex: 1, fontSize: 15, fontWeight: "500", color: "#1f1f1f" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#777" },
  unauthorized: { flex: 1, justifyContent: "center", alignItems: "center" },
});