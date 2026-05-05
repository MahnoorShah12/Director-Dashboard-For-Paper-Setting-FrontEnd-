
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
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ FIXED
import axios from "axios";
import { BASE_URL } from "../../config/Api";
import { useNavigation } from "@react-navigation/native";

const PastPaper = () => {
  const navigation = useNavigation();

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [selectedPaper, setSelectedPaper] = useState(null);

  // ===== FETCH =====
  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/allPapers/past_papers`, {
        params: {
          term: term || undefined,
        },
      });

      setPapers(res.data?.Papers || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [term]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // ===== FILTER =====
  const filteredPapers = useMemo(() => {
    const text = search.toLowerCase();
    return papers.filter(
      (p) =>
        (p.CourseTitle || "").toLowerCase().includes(text) ||
        (p.CourseCode || "").toLowerCase().includes(text) ||
        (p.SessionName || "").toLowerCase().includes(text) // ✅ added session search
    );
  }, [papers, search]);

  // ===== STATS =====
  const midCount = filteredPapers.filter((p) => p.Term === "mid").length;
  const finalCount = filteredPapers.filter((p) => p.Term === "final").length;

  // ===== NAVIGATION =====
  const handleViewPaper = (paper) => {
    setSelectedPaper(null);
    navigation.navigate("PastPaperView", { paper });
  };

  // ===== CARD =====
  const renderItem = ({ item }) => {
    const isMid = item.Term === "mid";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedPaper(item)}
      >
        <View style={styles.badgeWrapper}>
          <Text style={isMid ? styles.midBadge : styles.finalBadge}>
            {isMid ? "📝 Mid" : "📋 Final"}
          </Text>
        </View>

        <Text style={styles.title}>{item.CourseTitle}</Text>

        <Text style={styles.info}>📅 {item.SessionName}</Text>
        {item.CourseCode && (
          <Text style={styles.info}>🔖 {item.CourseCode}</Text>
        )}

        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => handleViewPaper(item)}
        >
          <Text style={styles.viewText}>👁 Preview Paper</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <Text style={styles.header}>📚 Past Papers Library</Text>
        <Text style={styles.subHeader}>
          Access previous papers for preparation
        </Text>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{filteredPapers.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{midCount}</Text>
            <Text style={styles.statLabel}>Mid</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{finalCount}</Text>
            <Text style={styles.statLabel}>Final</Text>
          </View>
        </View>

        {/* SEARCH */}
        <TextInput
          placeholder="Search by course title, code, or session..." // ✅ FIXED TEXT
          placeholderTextColor="#9ca3af" // ✅ FIXED VISIBILITY
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        {/* FILTER */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, term === "mid" && styles.activeFilter]}
            onPress={() => setTerm("mid")}
          >
            <Text>Mid</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, term === "final" && styles.activeFilter]}
            onPress={() => setTerm("final")}
          >
            <Text>Final</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setTerm("")}
          >
            <Text>All</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" />
        ) : filteredPapers.length === 0 ? (
          <Text style={styles.empty}>No Papers Found</Text>
        ) : (
          <FlatList
            data={filteredPapers}
            keyExtractor={(item) => item.PaperId?.toString()}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={!!selectedPaper} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {selectedPaper?.CourseTitle}
            </Text>

            <Text style={styles.modalText}>
              📅 {selectedPaper?.SessionName}
            </Text>
            <Text style={styles.modalText}>
              🔖 {selectedPaper?.CourseCode}
            </Text>

            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => handleViewPaper(selectedPaper)}
            >
              <Text style={styles.viewText}>View Full Paper</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedPaper(null)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PastPaper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    padding: 12,
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#14532d",
  },

  subHeader: {
    color: "#555",
    marginBottom: 10,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  statBox: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
  },

  statLabel: {
    fontSize: 12,
    color: "#666",
  },

  search: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    marginVertical: 10,
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  filterBtn: {
    flex: 1,
    backgroundColor: "#dcfce7",
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
  },

  activeFilter: {
    backgroundColor: "#22c55e",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },

  badgeWrapper: {
    alignItems: "flex-end",
  },

  midBadge: {
    backgroundColor: "#fef3c7",
    padding: 5,
    borderRadius: 20,
    fontSize: 12,
  },

  finalBadge: {
    backgroundColor: "#fee2e2",
    padding: 5,
    borderRadius: 20,
    fontSize: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 5,
  },

  info: {
    color: "#666",
    fontSize: 13,
  },

  viewBtn: {
    marginTop: 10,
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  viewText: {
    color: "#fff",
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
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
    borderRadius: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#14532d",
  },

  modalText: {
    marginTop: 5,
  },

  closeBtn: {
    marginTop: 10,
    backgroundColor: "#14532d",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});