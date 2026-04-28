


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../config/Api";

const PaperVerification = ({ sessionId }) => {
  const [papers, setPapers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toggleStates, setToggleStates] = useState({});

  // ===== FETCH PAPERS =====
  const fetchPapers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/paperVerification/get_approved_papers_summary`,
        {
          params: {
            sessionId: sessionId || undefined,
          },
        }
      );

      const papersData = (res.data?.data || []).map((p) => ({
        ...p,
        id: p.Id,
        CourseCode: p.CourseCode || "CS-101",
      }));

      setPapers(papersData);
      setFiltered(papersData);

      // init toggles
      let toggles = {};
      papersData.forEach((p) => {
        if (p.Status === "Approved") {
          toggles[p.id] = false;
        }
      });
      setToggleStates(toggles);

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [sessionId]);

  // ===== SEARCH =====
  useEffect(() => {
    const result = papers.filter((p) =>
      `${p.SubjectName} ${p.Teacher} ${p.Status} ${p.CourseCode}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, papers]);

  // ===== TOGGLE =====
  const handleToggle = async (paperId) => {
    setToggleStates((prev) => ({
      ...prev,
      [paperId]: !prev[paperId],
    }));

    try {
      const res = await axios.post(
        `${BASE_URL}/paperVerification/verifyPaper`,
        { PaperId: paperId }
      );

      if (res.data.success) {
        setPapers((prev) =>
          prev.map((p) =>
            p.id === paperId ? { ...p, Status: "Verified" } : p
          )
        );
      } else {
        setToggleStates((prev) => ({ ...prev, [paperId]: false }));
      }
    } catch (e) {
      console.log(e);
      setToggleStates((prev) => ({ ...prev, [paperId]: false }));
    }
  };

  // ===== COUNTS =====
  const verifiedCount = filtered.filter((p) => p.Status === "Verified").length;
  const pendingCount = filtered.filter((p) => p.Status !== "Verified").length;

  // ===== CARD =====
  const renderItem = ({ item }) => {
    const isApproved = item.Status === "Approved";
    const isVerified = item.Status === "Verified";

    return (
      <View style={[styles.card,
        isApproved ? styles.approvedCard :
        isVerified ? styles.verifiedCard : styles.pendingCard
      ]}>

        {/* HEADER */}
        <View style={styles.cardHeader}>
          <Text style={styles.courseCode}>{item.CourseCode}</Text>

          {isApproved && (
            <TouchableOpacity
              style={[
                styles.toggle,
                toggleStates[item.id] ? styles.toggleOn : styles.toggleOff
              ]}
              onPress={() => handleToggle(item.id)}
            >
              <View style={styles.knob} />
            </TouchableOpacity>
          )}
        </View>

        {/* BODY */}
        <Text style={styles.subject}>{item.SubjectName}</Text>
        <Text style={styles.term}>{item.Term} Term</Text>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.label}>Teacher</Text>
            <Text style={styles.teacher}>{item.Teacher}</Text>
          </View>

          <Text style={[
            styles.badge,
            isVerified ? styles.verified : styles.pending
          ]}>
            {isVerified ? "Verified" : "Pending"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <Text style={styles.title}>Paper Verification</Text>

      <View style={styles.stats}>
        <Text>Total: {filtered.length}</Text>
        <Text>Verified: {verifiedCount}</Text>
        <Text>Pending: {pendingCount}</Text>
      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};


export default PaperVerification;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef7f2",
    padding: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f5437",
    marginBottom: 10,
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#cce3d6",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
  },

  approvedCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#40916c",
  },

  verifiedCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#74c69d",
  },

  pendingCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#f4a261",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  courseCode: {
    fontWeight: "bold",
    color: "#2d6a4f",
  },

  subject: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 5,
  },

  term: {
    color: "#777",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },

  label: {
    fontSize: 10,
    color: "#999",
  },

  teacher: {
    fontWeight: "bold",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  verified: {
    backgroundColor: "#d8f3dc",
    color: "#1b4332",
  },

  pending: {
    backgroundColor: "#ffe5b4",
    color: "#99582a",
  },

  toggle: {
    width: 40,
    height: 22,
    borderRadius: 20,
    justifyContent: "center",
    padding: 2,
  },

  toggleOn: {
    backgroundColor: "#40916c",
  },

  toggleOff: {
    backgroundColor: "#ccc",
  },

  knob: {
    width: 18,
    height: 18,
    borderRadius: 50,
    backgroundColor: "#fff",
  },
});

