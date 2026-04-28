import React, { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../../../../config/Api";

export default function CheckPolicyModal({
  visible,
  paperDetails,
  clos = [],
  onClose,
  onPolicyCheck,
}) {
  const [policy, setPolicy] = useState(null);
  const [cloPolicy, setCloPolicy] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdated, setStatusUpdated] = useState(false);

  const courseId = paperDetails?.CourseId;
  const term = (paperDetails?.Term || "").toLowerCase();
  const allQuestions = paperDetails?.Questions ?? [];
  const questions = allQuestions.filter((q) => !q?.IsExtra);

  useEffect(() => {
    if (!visible) return;
    const fetchPolicies = async () => {
      if (!courseId || !term) {
        setPolicy(null);
        setCloPolicy([]);
        setTopics([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [policyRes, cloRes, topicRes] = await Promise.all([
          axios.get(`${BASE_URL}/policy/getPolicy/${courseId}/${term}`),
          axios.get(`${BASE_URL}/policy/getCloPolicy/${courseId}/${term}`),
          axios.get(`${BASE_URL}/Topics/get_Topics/${courseId}`),
        ]);
        setPolicy(policyRes?.data ?? null);
        setCloPolicy(Array.isArray(cloRes?.data) ? cloRes.data : []);
        setTopics(Array.isArray(topicRes?.data) ? topicRes.data : []);
      } catch (err) {
        console.error("Failed to fetch policy data:", err);
        setPolicy(null);
        setCloPolicy([]);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [visible, courseId, term]);

  const actualPercentage = useMemo(() => {
    const counts = { easy: 0, medium: 0, tough: 0 };
    questions.forEach((q) => {
      const level = (q?.DifficultyLevel || "").toLowerCase();
      if (counts[level] !== undefined) counts[level]++;
    });
    const total = questions.length || 1;
    return {
      easy: Math.round((counts.easy / total) * 100),
      medium: Math.round((counts.medium / total) * 100),
      tough: Math.round((counts.tough / total) * 100),
    };
  }, [questions]);

  const actualCloPercentage = useMemo(() => {
    const counts = {};
    questions.forEach((q) => {
      const id = q?.CloId;
      if (id != null) counts[id] = (counts[id] || 0) + 1;
    });
    const total = questions.length || 1;
    const result = {};
    Object.keys(counts).forEach((k) => {
      result[k] = Math.round((counts[k] / total) * 100);
    });
    return result;
  }, [questions]);

  const checkStatus = (level) => {
    if (!policy) return "missing";
    const required = Number(policy[level] ?? 0);
    const actual = Number(actualPercentage[level] ?? 0);
    if (actual === required) return "fulfilled";
    if (actual > required) return "exceeded";
    return "missing";
  };

  const getStatusIcon = (status) => {
    if (status === "fulfilled") return "✅";
    if (status === "exceeded") return "⚠️";
    return "❌";
  };

  const isDifficultyFulfilled = ["easy", "medium", "tough"].every(
    (level) => checkStatus(level) === "fulfilled"
  );

  const isCloFulfilled =
    Array.isArray(cloPolicy) &&
    cloPolicy.length > 0 &&
    cloPolicy.every((c) => {
      const actual = actualCloPercentage[c?.cloId] ?? 0;
      return actual === Number(c?.weightage ?? 0);
    });

  const isFullyFulfilled = isDifficultyFulfilled && (cloPolicy.length === 0 ? true : isCloFulfilled);

  // Inform parent about policy check result
  useEffect(() => {
    if (!loading && onPolicyCheck) {
      onPolicyCheck(Boolean(isFullyFulfilled));
    }
  }, [isFullyFulfilled, loading, onPolicyCheck]);

  // Auto-update paper status once (safe)
//   useEffect(() => {
//     if (
//       !loading &&
//       policy &&
//       isFullyFulfilled &&
//       !statusUpdated &&
//       paperDetails?.PaperStatus !== "Policy Fulfilled"
//     ) {
//       const updateStatus = async () => {
//   try {
//     const response = await axios.post(`${BASE_URL}/paper/updateStatus/${paperDetails?.PaperId}`, {
//       status: "Policy Fulfilled"
//     });
//     // Optionally update local state
//     setPaperDetails(prev => ({
//       ...prev,
//       PaperStatus: response.data?.PaperStatus || "Policy Fulfilled"
//     }));
//     setMessage("Paper status updated successfully!");
//     setMessageType("success");
//     setTimeout(() => {
//       setMessage("");
//       setMessageType("");
//     }, 3000);
//   } catch (error) {
//     setMessage("Failed to update paper status.");
//     setMessageType("error");
//   }
// };
//     }
//   }, [isFullyFulfilled, loading, policy, statusUpdated, paperDetails, onPolicyCheck]);

const hasUpdatedRef = useRef(false);

useEffect(() => {
  const updateStatus = async () => {
    if (
      loading ||
      !policy ||
      !isFullyFulfilled ||
      hasUpdatedRef.current ||
      paperDetails?.PaperStatus === "Policy Fulfilled"
    ) {
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/paper/updateStatus/${paperDetails?.PaperId}`,
        { status: "Policy Fulfilled" }
      );

      hasUpdatedRef.current = true;
      setStatusUpdated(true);

      console.log("✅ Paper status updated successfully");
    } catch (err) {
      console.log("❌ Status update failed:", err?.message);
    }
  };

  updateStatus();
}, [isFullyFulfilled, loading, policy, paperDetails?.PaperId, paperDetails?.PaperStatus]);
  // Alerts text
  const difficultyAlerts = ["easy", "medium", "tough"]
    .map((level) => ({ level, status: checkStatus(level) }))
    .filter((d) => d.status !== "fulfilled")
    .map((d) => `${d.level.toUpperCase()} ${d.status === "missing" ? "↓ below" : "↑ above"}`);

  const cloAlerts = (cloPolicy || [])
    .map((clo, index) => {
      const actual = actualCloPercentage[clo?.cloId] ?? 0;
      const required = Number(clo?.weightage ?? 0);
      if (actual === required) return null;
      return `CLO ${index + 1} ${actual < required ? `↓ ${required - actual}%` : `↑ ${actual - required}%`}`;
    })
    .filter(Boolean);

  // Render states
  if (!visible) return null;

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading policy data...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!policy) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.noPolicyTitle}>No Policy Found</Text>
            <Text style={styles.noPolicyText}>
              This course doesn't have a policy configured for the {term} term.
            </Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={onClose}>
                <Text style={styles.primaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Question Policy Analysis</Text>
              <Text style={styles.courseInfo}>
                Course ID: {courseId ?? "N/A"} • {term || "N/A"} term
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Alerts */}
          {(difficultyAlerts.length || cloAlerts.length) > 0 ? (
            <View style={styles.alertBanner}>
              <Text style={styles.alertText}>
                ⚠️ Attention: {difficultyAlerts.concat(cloAlerts).join(", ")}
              </Text>
            </View>
          ) : null}

          <ScrollView contentContainerStyle={styles.content}>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Questions</Text>
                <Text style={styles.statValue}>{questions.length}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Extra Questions</Text>
                <Text style={styles.statValue}>{allQuestions.length - questions.length}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Policy Status</Text>
                <Text style={[styles.statValue, isFullyFulfilled ? styles.successText : styles.warnText]}>
                  {isFullyFulfilled ? "Fulfilled" : "Pending"}
                </Text>
              </View>
            </View>

            {/* Difficulty Cards */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Difficulty Distribution</Text>
              {["easy", "medium", "tough"].map((level) => {
                const required = Number(policy[level] ?? 0);
                const actual = Number(actualPercentage[level] ?? 0);
                const status = checkStatus(level);
                const diff = Math.abs(actual - required);
                return (
                  <View key={level} style={styles.policyCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.levelBadge}>{level.toUpperCase()}</Text>
                      <Text style={styles.statusIcon}>{getStatusIcon(status)}</Text>
                    </View>
                    <Text style={styles.percentText}>
                      {actual}% / {required}%
                    </Text>
                    <Text style={styles.smallText}>
                      {status === "fulfilled" && "Matches policy"}
                      {status === "missing" && `↓ ${diff}% below target`}
                      {status === "exceeded" && `↑ ${diff}% above target`}
                    </Text>
                    <Text style={styles.smallText}>
                      {questions.filter((q) => (q?.DifficultyLevel || "").toLowerCase() === level).length} questions
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* CLO Policy */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CLO Weightage Analysis</Text>
              {(cloPolicy || []).map((clo, index) => {
                const actual = actualCloPercentage[clo?.cloId] ?? 0;
                const required = Number(clo?.weightage ?? 0);
                const status = actual === required ? "fulfilled" : actual > required ? "exceeded" : "missing";
                return (
                  <View key={String(clo?.cloId) + index} style={styles.policyCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.levelBadge}>CLO {index + 1}</Text>
                      <Text>{actual}% / {required}%</Text>
                    </View>
                    <Text style={styles.smallText}>
                      {status === "fulfilled" && "✓ Matches weightage"}
                      {status === "missing" && `↓ ${required - actual}% below target`}
                      {status === "exceeded" && `↑ ${actual - required}% above target`}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* All CLOs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All CLOs in this Course</Text>
              {(clos || []).map((c, i) => (
                <View key={c?.Id ?? i} style={styles.listItem}>
                  <Text style={styles.listIndex}>{i + 1}.</Text>
                  <Text style={styles.listText}>{c?.Title ?? `CLO ${i + 1}`}</Text>
                </View>
              ))}
            </View>

            {/* Topics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Topics in this Course</Text>
              {(topics || []).length === 0 ? (
                <Text style={styles.smallText}>No topics found for this course.</Text>
              ) : (
                (topics || []).map((t, i) => (
                  <View key={t?.id ?? i} style={styles.listItem}>
                    <Text style={styles.listIndex}>{i + 1}.</Text>
                    <Text style={styles.listText}>{t?.description ?? `Topic ${i + 1}`}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Footer status */}
            <View style={[styles.overallStatus, isFullyFulfilled ? styles.successBg : styles.warnBg]}>
              <Text style={styles.overallText}>
                <Text style={{ fontWeight: "700" }}>
                  {isFullyFulfilled ? "All policy requirements met" : "Policy requirements not fully met"}
                </Text>
                {"\n"}
                <Text style={styles.smallText}>
                  {isFullyFulfilled
                    ? "The question distribution and CLO weightage match the course policy."
                    : "Adjust question difficulty distribution and CLO weightage to match policy."}
                </Text>
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
  },
  modal: {
    width: "92%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  title: { fontSize: 18, fontWeight: "700" },
  courseInfo: { color: "#666", marginTop: 4 },
  close: { fontSize: 22 },
  alertBanner: { backgroundColor: "#fff3cd", padding: 10 },
  alertText: { color: "#7a4d00" },
  content: { padding: 12, paddingBottom: 24 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  statCard: { width: "30%", backgroundColor: "#f6f9f6", padding: 12, borderRadius: 10, alignItems: "center" },
  statLabel: { color: "#444", fontSize: 12 },
  statValue: { fontSize: 18, fontWeight: "700", marginTop: 6 },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  policyCard: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: "#eee" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  levelBadge: { fontWeight: "700" },
  statusIcon: { fontSize: 18 },
  percentText: { color: "#333", marginBottom: 6 },
  smallText: { color: "#666" },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  listIndex: { width: 24, fontWeight: "700" },
  listText: { flex: 1 },
  overallStatus: { marginTop: 12, padding: 12, borderRadius: 10 },
  overallText: { color: "#fff" },
  successBg: { backgroundColor: "#16a34a" },
  warnBg: { backgroundColor: "#f59e0b" },
  successText: { color: "#16a34a", fontWeight: "700" },
  warnText: { color: "#b45309", fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  primaryBtn: { backgroundColor: "#16a34a", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});