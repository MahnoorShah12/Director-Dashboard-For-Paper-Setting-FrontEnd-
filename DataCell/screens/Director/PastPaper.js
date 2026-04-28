import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../config/Api";
import { useNavigation } from "@react-navigation/native";

const PastPaper = () => {
  const navigation = useNavigation();

  const [papers, setPapers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [term, setTerm] = useState("");
  const [selectedPaper, setSelectedPaper] = useState(null);

  // ===== FETCH SESSIONS =====
  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/session/get_all_sessions`);
      setSessions(res.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  // ===== FETCH PAPERS =====
  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/allPapers/past_papers`, {
        params: {
          sessionId: sessionId || undefined,
          term: term || undefined,
        },
      });

      setPapers(res.data?.Papers || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [sessionId, term]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // ===== FILTER =====
  const filteredPapers = useMemo(() => {
    const text = search.toLowerCase();
    return papers.filter(
      (p) =>
        (p.CourseTitle || "").toLowerCase().includes(text) ||
        (p.CourseCode || "").toLowerCase().includes(text)
    );
  }, [papers, search]);

  // ===== STATS =====
  const midCount = filteredPapers.filter((p) => p.Term === "mid").length;
  const finalCount = filteredPapers.filter((p) => p.Term === "final").length;

  // ===== VIEW PAPER NAVIGATION (IMPORTANT FIX) =====
  const handleViewPaper = (paper) => {
    setSelectedPaper(null);

    navigation.navigate("PastPaperView", {
      paper: {
        ...paper,
      },
    });
  };

  // ===== CARD =====
  const renderItem = ({ item }) => {
    const isMid = item.Term === "mid";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedPaper(item)}
      >
        <Text style={styles.title}>{item.CourseTitle}</Text>
        <Text>{item.SessionName}</Text>
        <Text>{item.CourseCode}</Text>

        <View style={styles.row}>
          <Text style={isMid ? styles.mid : styles.final}>
            {isMid ? "Mid Term" : "Final Term"}
          </Text>
        </View>

        {/* ✅ VIEW BUTTON (like React JS Preview Paper) */}
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => handleViewPaper(item)}
        >
          <Text style={{ color: "#fff" }}>👁 View Paper</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <Text style={styles.header}>📚 Past Papers Library</Text>

      {/* ===== STATS ===== */}
      <View style={styles.stats}>
        <Text>Total: {filteredPapers.length}</Text>
        <Text>Mid: {midCount}</Text>
        <Text>Final: {finalCount}</Text>
      </View>

      {/* ===== SEARCH ===== */}
      <TextInput
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* ===== FILTER ===== */}
      <View style={styles.filterRow}>
        <TouchableOpacity onPress={() => setTerm("mid")} style={styles.btn}>
          <Text>Mid</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTerm("final")} style={styles.btn}>
          <Text>Final</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTerm("")} style={styles.btn}>
          <Text>All</Text>
        </TouchableOpacity>
      </View>

      {/* ===== LIST ===== */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredPapers}
          keyExtractor={(item) => item.PaperId?.toString()}
          renderItem={renderItem}
        />
      )}

      {/* ===== MODAL ===== */}
      <Modal visible={!!selectedPaper} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text style={styles.title}>
              {selectedPaper?.CourseTitle}
            </Text>

            <Text>{selectedPaper?.SessionName}</Text>
            <Text>{selectedPaper?.CourseCode}</Text>

            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => handleViewPaper(selectedPaper)}
            >
              <Text style={{ color: "#fff" }}>👁 Open Full View</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedPaper(null)}>
              <Text style={{ marginTop: 10 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PastPaper;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    padding: 12,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#14532d",
    marginBottom: 10,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  statBox: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
  },

  statLabel: {
    fontSize: 12,
    color: "#555",
  },

  search: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dcfce7",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  filterBtn: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    backgroundColor: "#dcfce7",
    borderRadius: 8,
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#22c55e",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  courseCode: {
    fontWeight: "bold",
    color: "#14532d",
  },

  termBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  midBadge: {
    backgroundColor: "#fef3c7",
  },

  finalBadge: {
    backgroundColor: "#fee2e2",
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 5,
    color: "#111",
  },

  infoRow: {
    marginTop: 4,
  },

  info: {
    color: "#666",
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#14532d",
  },

  modalText: {
    marginBottom: 5,
  },

  closeBtn: {
    marginTop: 10,
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});