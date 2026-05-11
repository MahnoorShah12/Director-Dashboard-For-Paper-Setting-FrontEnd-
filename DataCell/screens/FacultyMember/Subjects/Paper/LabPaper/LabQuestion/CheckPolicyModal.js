import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import axios from "axios";
import { BASE_URL } from "../../../../../../config/Api";

const CheckPolicyModal = ({
  visible,
  paperDetails,
  clos = [],
  onClose,
  onPolicyCheck,
}) => {
  const [policy, setPolicy] = useState(null);
  const [cloPolicy, setCloPolicy] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdated, setStatusUpdated] = useState(false);

  const courseId = paperDetails?.CourseId;
  const term = paperDetails?.Term?.toLowerCase();

  const allQuestions = paperDetails?.Questions || [];
  const questions = allQuestions.filter((q) => !q.IsExtra);

  // ================= FETCH DATA =================

  useEffect(() => {
    const fetchPolicies = async () => {
      if (!courseId || !term) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [policyRes, cloRes, topicRes] = await Promise.all([
          axios.get(
            `${BASE_URL}/policy/getPolicy/${courseId}/${term}`
          ),

          axios.get(
            `${BASE_URL}/policy/getCloPolicy/${courseId}/${term}`
          ),

          axios.get(
            `${BASE_URL}/Topics/get_Topics/${courseId}`
          ),
        ]);

        setPolicy(policyRes.data);
        setCloPolicy(cloRes.data || []);
        setTopics(topicRes.data || []);
      } catch (err) {
        console.log("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [courseId, term]);

  // ================= DIFFICULTY % =================

  const actualPercentage = useMemo(() => {
    const counts = {
      easy: 0,
      medium: 0,
      tough: 0,
    };

    questions.forEach((q) => {
      const level = q.DifficultyLevel?.toLowerCase();

      if (counts[level] !== undefined) {
        counts[level]++;
      }
    });

    const total = questions.length || 1;

    return {
      easy: Math.round((counts.easy / total) * 100),
      medium: Math.round((counts.medium / total) * 100),
      tough: Math.round((counts.tough / total) * 100),
    };
  }, [questions]);

  // ================= CLO % =================

  const actualCloPercentage = useMemo(() => {
    const counts = {};

    questions.forEach((q) => {
      if (q.CloId) {
        counts[q.CloId] =
          (counts[q.CloId] || 0) + 1;
      }
    });

    const total = questions.length || 1;

    const result = {};

    Object.keys(counts).forEach((cloId) => {
      result[cloId] = Math.round(
        (counts[cloId] / total) * 100
      );
    });

    return result;
  }, [questions]);

  // ================= STATUS =================

  const checkStatus = (level) => {
    if (!policy) return "missing";

    const required = policy[level] || 0;
    const actual = actualPercentage[level] || 0;

    if (actual === required) return "fulfilled";

    if (actual > required) return "exceeded";

    return "missing";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "fulfilled":
        return "✅";

      case "exceeded":
        return "⚠️";

      case "missing":
        return "❌";

      default:
        return "";
    }
  };

  const isDifficultyFulfilled = [
    "easy",
    "medium",
    "tough",
  ].every(
    (level) => checkStatus(level) === "fulfilled"
  );

  const isCloFulfilled =
    cloPolicy.length > 0 &&
    cloPolicy.every((clo) => {
      const actual =
        actualCloPercentage[clo.cloId] || 0;

      return actual === clo.weightage;
    });

  const isFullyFulfilled =
    isDifficultyFulfilled && isCloFulfilled;

  // ================= UPDATE STATUS =================

  useEffect(() => {
    if (
      !loading &&
      policy &&
      isFullyFulfilled &&
      !statusUpdated &&
      paperDetails?.PaperStatus !==
        "Policy Fulfilled"
    ) {
      const updateStatus = async () => {
        try {
          await axios.post(
            `${BASE_URL}/paper/updateStatus/${paperDetails.PaperId}`,
            {
              status: "Policy Fulfilled",
            }
          );

          setStatusUpdated(true);

          if (onPolicyCheck) {
            onPolicyCheck(true);
          }
        } catch (err) {
          console.log("Failed updating status", err);
        }
      };

      updateStatus();
    }
  }, [
    loading,
    policy,
    isFullyFulfilled,
    statusUpdated,
  ]);

  // ================= LOADING =================

  if (loading) {
    return (
      <Modal visible={visible} transparent>
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#2e7d32"
            />

            <Text style={styles.loadingText}>
              Loading policy data...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  // ================= NO POLICY =================

  if (!policy) {
    return (
      <Modal visible={visible} transparent>
        <View style={styles.overlay}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>📋</Text>

            <Text style={styles.errorTitle}>
              No Policy Found
            </Text>

            <Text style={styles.errorText}>
              This course doesn't have a policy
              configured for {term} term.
            </Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onClose}
            >
              <Text style={styles.primaryBtnText}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ================= MAIN =================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <Text style={styles.headerIcon}>
                  📊
                </Text>
              </View>

              <View>
                <Text style={styles.headerTitle}>
                  Question Policy Analysis
                </Text>

                <Text style={styles.courseInfo}>
                  Course ID: {courseId} •{" "}
                  {term?.toUpperCase()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            {/* ALERT */}

            {!isFullyFulfilled && (
              <View style={styles.alertBanner}>
                <Text style={styles.alertText}>
                  ⚠️ Policy requirements are not
                  fully fulfilled
                </Text>
              </View>
            )}

            {/* STATS */}

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>
                  Total Questions
                </Text>

                <Text style={styles.statValue}>
                  {questions.length}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>
                  Extra Questions
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    { color: "#f39c12" },
                  ]}
                >
                  {allQuestions.length -
                    questions.length}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>
                  Policy Status
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color: isFullyFulfilled
                        ? "#2e7d32"
                        : "#f39c12",
                    },
                  ]}
                >
                  {isFullyFulfilled
                    ? "Fulfilled"
                    : "Pending"}
                </Text>
              </View>
            </View>

            {/* DIFFICULTY */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Difficulty Analysis
              </Text>

              {["easy", "medium", "tough"].map(
                (level) => {
                  const required =
                    policy[level] || 0;

                  const actual =
                    actualPercentage[level] || 0;

                  const status =
                    checkStatus(level);

                  return (
                    <View
                      key={level}
                      style={[
                        styles.policyCard,
                        status === "fulfilled" &&
                          styles.fulfilledCard,

                        status === "missing" &&
                          styles.missingCard,

                        status === "exceeded" &&
                          styles.exceededCard,
                      ]}
                    >
                      <View
                        style={styles.cardHeader}
                      >
                        <Text
                          style={styles.levelBadge}
                        >
                          {level}
                        </Text>

                        <Text
                          style={styles.statusIcon}
                        >
                          {getStatusIcon(status)}
                        </Text>
                      </View>

                      <Text
                        style={styles.percentage}
                      >
                        {actual}% / {required}%
                      </Text>

                      {/* Progress */}

                      <View
                        style={styles.progressBar}
                      >
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${actual}%`,
                            },
                          ]}
                        />
                      </View>

                      <Text
                        style={styles.questionCount}
                      >
                        {
                          questions.filter(
                            (q) =>
                              q.DifficultyLevel?.toLowerCase() ===
                              level
                          ).length
                        }{" "}
                        Questions
                      </Text>
                    </View>
                  );
                }
              )}
            </View>

            {/* CLO */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                🎯 CLO Weightage Analysis
              </Text>

              {cloPolicy.map((clo, index) => {
                const actual =
                  actualCloPercentage[
                    clo.cloId
                  ] || 0;

                const required =
                  clo.weightage;

                const status =
                  actual === required
                    ? "fulfilled"
                    : actual > required
                    ? "exceeded"
                    : "missing";

                return (
                  <View
                    key={clo.cloId}
                    style={[
                      styles.policyCard,
                      status ===
                        "fulfilled" &&
                        styles.fulfilledCard,

                      status === "missing" &&
                        styles.missingCard,

                      status ===
                        "exceeded" &&
                        styles.exceededCard,
                    ]}
                  >
                    <View
                      style={styles.cardHeader}
                    >
                      <Text
                        style={styles.levelBadge}
                      >
                        CLO {index + 1}
                      </Text>

                      <Text
                        style={
                          styles.smallPercent
                        }
                      >
                        {actual}% / {required}%
                      </Text>
                    </View>

                    <View
                      style={styles.progressBar}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${actual}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* ALL CLOS */}

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>
                📚 All CLOs
              </Text>

              {clos.map((clo, index) => (
                <View
                  key={clo.Id}
                  style={styles.listItem}
                >
                  <View style={styles.indexBox}>
                    <Text
                      style={styles.indexText}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={styles.listText}>
                    {clo.Title}
                  </Text>
                </View>
              ))}
            </View>

            {/* TOPICS */}

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>
                📖 All Topics
              </Text>

              {topics.map((topic, index) => (
                <View
                  key={topic.id}
                  style={styles.listItem}
                >
                  <View style={styles.indexBox}>
                    <Text
                      style={styles.indexText}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={styles.listText}>
                    {topic.description}
                  </Text>
                </View>
              ))}
            </View>

            {/* FOOTER */}

            <View
              style={[
                styles.footerCard,
                isFullyFulfilled
                  ? styles.footerSuccess
                  : styles.footerWarning,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      isFullyFulfilled
                        ? "#2e7d32"
                        : "#f39c12",
                  },
                ]}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.footerTitle}>
                  {isFullyFulfilled
                    ? "All policy requirements met"
                    : "Policy requirements not fully met"}
                </Text>

                <Text style={styles.footerDesc}>
                  {isFullyFulfilled
                    ? "Question distribution and CLO weightage match policy"
                    : "Adjust difficulty distribution and CLO weightage"}
                </Text>
              </View>
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CheckPolicyModal;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(20,40,20,0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
  },

  modalContainer: {
    width: "100%",
    maxHeight: "94%",
    backgroundColor: "#f1f8e9",
    borderRadius: 28,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 22,
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#c8e6c9",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  headerIcon: {
    fontSize: 30,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#1b5e20",
  },

  courseInfo: {
    marginTop: 5,
    fontSize: 13,
    color: "#5a6b5a",
  },

  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#f1f8e9",
    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    fontSize: 22,
    color: "#2e7d32",
  },

  alertBanner: {
    margin: 18,
    backgroundColor: "#fff3cd",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#ffc107",
  },

  alertText: {
    color: "#856404",
    fontWeight: "600",
  },

  statsRow: {
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 6,
    padding: 18,
    borderRadius: 22,
    elevation: 3,
  },

  statLabel: {
    fontSize: 12,
    color: "#5a6b5a",
    marginBottom: 8,
    fontWeight: "600",
  },

  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1b5e20",
  },

  section: {
    paddingHorizontal: 18,
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: 18,
  },

  policyCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    elevation: 4,
    borderTopWidth: 5,
  },

  fulfilledCard: {
    borderTopColor: "#2e7d32",
  },

  missingCard: {
    borderTopColor: "#c0392b",
  },

  exceededCard: {
    borderTopColor: "#f39c12",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  levelBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 30,
    color: "#1b5e20",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  statusIcon: {
    fontSize: 24,
  },

  percentage: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1b5e20",
    textAlign: "center",
    marginBottom: 18,
  },

  smallPercent: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1b5e20",
  },

  progressBar: {
    height: 12,
    backgroundColor: "#dfe9df",
    borderRadius: 20,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 20,
  },

  questionCount: {
    marginTop: 14,
    textAlign: "center",
    color: "#5a6b5a",
    fontWeight: "500",
  },

  listSection: {
    marginHorizontal: 18,
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    elevation: 4,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },

  indexBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  indexText: {
    fontWeight: "700",
    color: "#1b5e20",
  },

  listText: {
    flex: 1,
    color: "#1c2e1c",
    fontWeight: "500",
    lineHeight: 22,
  },

  footerCard: {
    margin: 18,
    padding: 22,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  footerSuccess: {
    backgroundColor: "#e8f5e9",
  },

  footerWarning: {
    backgroundColor: "#fff5e6",
  },

  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 16,
  },

  footerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: 4,
  },

  footerDesc: {
    fontSize: 13,
    color: "#5a6b5a",
    lineHeight: 20,
  },

  loadingContainer: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 24,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: "600",
    color: "#1b5e20",
  },

  errorContainer: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 24,
    alignItems: "center",
  },

  errorIcon: {
    fontSize: 60,
    marginBottom: 18,
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: 10,
  },

  errorText: {
    textAlign: "center",
    color: "#5a6b5a",
    marginBottom: 28,
    lineHeight: 24,
  },

  primaryBtn: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 40,
  },

  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});