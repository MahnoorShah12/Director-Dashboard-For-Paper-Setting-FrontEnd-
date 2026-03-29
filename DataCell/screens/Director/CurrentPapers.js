import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../config/Api";

const tabs = ["All", "Uploaded", "Pending", "Approved", "Printed"];

const CurrentPapers = () => {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState("All");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  const [loggedInTeacher, setLoggedInTeacher] = useState("");

  useEffect(() => {
    fetchUser();
    fetchPapers();
  }, []);

  const fetchUser = async () => {
    const user = await AsyncStorage.getItem("user_name");
    setLoggedInTeacher(user?.toLowerCase() || "");
  };

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/allPapers/get`);
      setPapers(res.data.Papers || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = useMemo(() => {
    let filtered = papers;

    if (activeTab !== "All") {
      filtered = filtered.filter((p) => p.Status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.CourseCode?.toLowerCase().includes(q) ||
          p.CourseTitle?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [activeTab, papers, searchQuery]);

  const truncateText = (text, max = 40) =>
    text?.length > max ? text.substring(0, max) + "..." : text;

  const getStatusCount = (status) =>
    status === "All"
      ? papers.length
      : papers.filter((p) => p.Status === status).length;

  const handleView = (paper) => {
    if (paper.Status === "Pending") {
      setSelectedPaper(paper);
      setShowModal(true);
    } else {
      navigation.navigate("CreatePaper", {
        courseId: paper.CourseId,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Current Papers</Text>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search course..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* ✅ TABS (fixed & clean) */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab} ({getStatusCount(tab)})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ✅ LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#0B8F5A" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredPapers.map((paper) => (
            <View key={paper.PaperId} style={styles.card}>
              <Text style={styles.code}>{paper.CourseCode}</Text>
              <Text>{truncateText(paper.CourseTitle)}</Text>
              <Text>{paper.Term}</Text>

              <Text style={styles.status}>{paper.Status}</Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => handleView(paper)}
              >
                <Text style={styles.btnText}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {selectedPaper?.CourseTitle}
            </Text>

            <Text>Code: {selectedPaper?.CourseCode}</Text>
            <Text>Term: {selectedPaper?.Term}</Text>

            <Text style={{ marginTop: 10, fontWeight: "bold" }}>
              Teachers:
            </Text>

            {selectedPaper?.AssignedTeachers?.map((t, i) => (
              <Text
                key={i}
                style={
                  t.toLowerCase() === loggedInTeacher
                    ? styles.highlight
                    : null
                }
              >
                {t}
              </Text>
            ))}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowModal(false)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CurrentPapers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F4F6F8",
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0B8F5A",
  },

  search: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  // ✅ Tabs Wrapper (fix overlap issue)
  tabsWrapper: {
    marginBottom: 10,
  },

  tabs: {
    flexDirection: "row",
  },

  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    flexShrink: 0, // 🔥 main fix
  },

  activeTab: {
    backgroundColor: "#0B8F5A",
    borderColor: "#0B8F5A",
  },

  tabText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },

  activeTabText: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  code: {
    fontWeight: "bold",
    color: "#0B8F5A",
  },

  status: {
    marginTop: 5,
    fontWeight: "bold",
  },

  button: {
    marginTop: 8,
    backgroundColor: "#0B8F5A",
    padding: 10,
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },

  modal: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  closeBtn: {
    marginTop: 15,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  highlight: {
    color: "green",
    fontWeight: "bold",
  },
});