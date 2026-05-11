// Questions.jsx - React Native version with Professional Green Theme
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import axios from "axios";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { launchImageLibrary } from "react-native-image-picker";
// import { diffChars } from "diff";

// Replace with your actual config
import { BASE_URL } from "../../../../../../config/Api";


const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Theme Colors ────────────────────────────────────────────────
const C = {
  primary50: "#ecfdf5",
  primary100: "#d1fae5",
  primary200: "#a7f3d0",
  primary300: "#6ee7b7",
  primary400: "#34d399",
  primary500: "#10b981",
  primary600: "#059669",
  primary700: "#047857",
  primary800: "#065f46",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  white: "#ffffff",
};

// ─── Notification Banner ─────────────────────────────────────────
const Notification = ({ message, type, onClose }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();
  }, []);
  if (!message) return null;
  return (
    <Animated.View
      style={[
        styles.notification,
        type === "success" ? styles.notifSuccess : styles.notifError,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] },
      ]}
    >
      <View style={styles.notifContent}>
        <View style={[styles.notifIcon, type === "success" ? styles.notifIconSuccess : styles.notifIconError]}>
          <Text style={styles.notifIconText}>{type === "success" ? "✓" : "✕"}</Text>
        </View>
        <Text style={styles.notifText}>{message}</Text>
      </View>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.notifClose}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────
const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCard}>
    <View style={styles.statIcon}>
      <Text style={styles.statIconText}>{icon}</Text>
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={2}>{value}</Text>
    </View>
  </View>
);

// ─── Chat Modal ──────────────────────────────────────────────────
const ChatModal = ({ visible, title, messages, userId, newMessage, onChangeMessage, onSend, onClose, endRef }) => {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (visible && scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.chatModalContainer}>
          {/* Header */}
          <View style={styles.chatHeader}>
            <View>
              <Text style={styles.chatLiveIndicator}>● LIVE</Text>
              <Text style={styles.chatTitle}>{title}</Text>
            </View>
            <TouchableOpacity style={styles.chatCloseBtn} onPress={onClose}>
              <Text style={styles.chatCloseBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView ref={scrollRef} style={styles.chatBody} contentContainerStyle={styles.chatBodyContent}>
            {messages.length === 0 ? (
              <Text style={styles.noMessages}>No messages yet.</Text>
            ) : (
              messages.map((c, idx) => {
                const isSender = c.SenderId === userId || c.CommentSenderId === userId;
                const text = c.Text || c.CommentText || "";
                const sender = c.SenderName || c.CommentSenderName || "User";
                const time = c.CreatedAt
                  ? new Date(c.CreatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "";
                return (
                  <View key={c.Id || c.id || idx} style={[styles.messageBubble, isSender ? styles.sentBubble : styles.receivedBubble]}>
                    <Text style={styles.messageSender}>{sender}</Text>
                    <Text style={styles.messageText}>{text}</Text>
                    {time ? <Text style={styles.messageTime}>{time}</Text> : null}
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.chatFooter}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor={C.gray400}
              value={newMessage}
              onChangeText={onChangeMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Summary Modal ───────────────────────────────────────────────
const SummaryModal = ({ visible, summary, selectedQuestion, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.summaryModalContainer}>
        {/* Header */}
        <View style={styles.summaryHeader}>
          <View style={styles.summaryHeaderLeft}>
            <View style={styles.summaryHeaderIcon}><Text style={{ fontSize: 20 }}>📊</Text></View>
            <Text style={styles.summaryHeaderTitle}>Question Approval Summary</Text>
          </View>
          <TouchableOpacity style={styles.summaryCloseBtn} onPress={onClose}>
            <Text style={styles.summaryCloseBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.summaryBody}>
          {/* Stats Row */}
          <View style={styles.summaryStatsRow}>
            {[
              { label: "Approved", value: summary.approved, color: C.success, bg: "#ecfdf5", border: "#a7f3d0", icon: "✓" },
              { label: "Rejected", value: summary.rejected, color: C.error, bg: "#fef2f2", border: "#fecaca", icon: "✗" },
              { label: "Pending", value: summary.pending, color: C.warning, bg: "#fffbeb", border: "#fde68a", icon: "⋯" },
            ].map((s) => (
              <View key={s.label} style={[styles.summaryStatCard, { backgroundColor: s.bg, borderColor: s.border }]}>
                <View style={[styles.summaryStatIcon, { backgroundColor: s.bg }]}>
                  <Text style={[styles.summaryStatIconText, { color: s.color }]}>{s.icon}</Text>
                </View>
                <Text style={[styles.summaryStatValue, { color: C.gray900 }]}>{s.value}</Text>
                <Text style={[styles.summaryStatLabel, { color: s.color }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Progress Bar */}
          {(() => {
            const total = summary.approved + summary.rejected + summary.pending;
            const pct = total > 0 ? Math.round((summary.approved / total) * 100) : 0;
            return (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Approval Progress</Text>
                  <View style={styles.progressPercentBadge}>
                    <Text style={styles.progressPercent}>{pct}%</Text>
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })()}

          {/* Teacher List */}
          {selectedQuestion?.TeacherStatuses?.length > 0 ? (
            <View style={styles.teacherSection}>
              <Text style={styles.teacherSectionTitle}>
                👥 Faculty Responses ({selectedQuestion.TeacherStatuses.length})
              </Text>
              {selectedQuestion.TeacherStatuses.map((t, idx) => (
                <View key={idx} style={styles.teacherItem}>
                  <View style={styles.teacherLeft}>
                    <View style={styles.teacherInitial}>
                      <Text style={styles.teacherInitialText}>{t.TeacherName?.charAt(0).toUpperCase() || "T"}</Text>
                    </View>
                    <View>
                      <Text style={styles.teacherName}>{t.TeacherName}</Text>
                      <Text style={styles.teacherRole}>Faculty</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.teacherStatusBadge,
                    t.Status === "approved" ? styles.badgeApproved : t.Status === "reject" ? styles.badgeRejected : styles.badgePending,
                  ]}>
                    <Text style={[
                      styles.teacherStatusText,
                      t.Status === "approved" ? { color: "#059669" } : t.Status === "reject" ? { color: "#dc2626" } : { color: "#d97706" },
                    ]}>
                      {t.Status === "approved" ? "✓ Approved" : t.Status === "reject" ? "✗ Rejected" : "⋯ Pending"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No faculty responses yet</Text>
              <Text style={styles.emptySubtext}>Faculty members will review and respond to this question</Text>
            </View>
          )}
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

// ─── Main Component ───────────────────────────────────────────────
const Question = ({ route, navigation }) => {
  // If using React Navigation: const { paperId } = route.params;
  const paperId = route?.params?.paperId || "1";

  const [paperDetails, setPaperDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editForm, setEditForm] = useState({ text: "", marks: 0, difficulty: "easy", cloId: null });

  const [userId, setUserId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [clos, setClos] = useState([]);
  const [loadingClos, setLoadingClos] = useState(true);
  const [createPaper, setCreatePaper] = useState(false);
  const [isUserDirector, setIsUserDirector] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [showQuestionComments, setShowQuestionComments] = useState(false);
  const [questionComments, setQuestionComments] = useState([]);
  const [newQuestionComment, setNewQuestionComment] = useState("");
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);

  const paperCommentsIntervalRef = useRef(null);
  const questionCommentsIntervalRef = useRef(null);

  // ── Helpers ──
  const showMsg = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => { setMessage(""); setMessageType(""); }, 3000);
  };

  // ── Data Fetching ──
  const refreshPaperDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}paper/GetPaperDetails/${paperId}`);
      if (res.data?.PaperId) { setPaperDetails(res.data); return res.data; }
    } catch (e) { console.error(e); }
    return null;
  };

  const refreshComments = async () => {
    try {
      const res = await axios.get(`${API_URL}comment/get_by_paper/${paperId}`);
      setComments(res.data || []);
    } catch (e) { console.error(e); }
  };

  const refreshQuestionComments = async (qId) => {
    if (!qId) return;
    try {
      const res = await axios.get(`${API_URL}comment/get_by_question/${qId}`);
      setQuestionComments(res.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    // Load from AsyncStorage or your auth store
    // const storedId = await AsyncStorage.getItem("user_id");
    const storedId = "1"; // placeholder
    const storedRoles = ["teacher"]; // placeholder
    setUserId(parseInt(storedId, 10));
    setRoles(storedRoles.map(r => r.toLowerCase()));
    setIsUserDirector(storedRoles.map(r => r.toLowerCase()).includes("director"));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}paper/GetPaperDetails/${paperId}`);
        if (!res.data?.PaperId) return;
        setPaperDetails(res.data);
        setCourseId(res.data.CourseId);
        setActiveTab(0);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [paperId]);

  useEffect(() => {
    if (!courseId) return;
    const fetchCLOs = async () => {
      try {
        setLoadingClos(true);
        const res = await axios.get(`${API_URL}clos/get_Clos/${courseId}`);
        setClos(res.data.map(c => ({ Id: c.id, Title: c.description })));
      } catch (e) { console.error(e); }
      finally { setLoadingClos(false); }
    };
    fetchCLOs();
  }, [courseId]);

  useEffect(() => {
    if (showComments) {
      refreshComments();
      paperCommentsIntervalRef.current = setInterval(refreshComments, 2000);
    } else {
      clearInterval(paperCommentsIntervalRef.current);
    }
    return () => clearInterval(paperCommentsIntervalRef.current);
  }, [showComments]);

  useEffect(() => {
    if (showQuestionComments && currentQuestionId) {
      refreshQuestionComments(currentQuestionId);
      questionCommentsIntervalRef.current = setInterval(() => refreshQuestionComments(currentQuestionId), 2000);
    } else {
      clearInterval(questionCommentsIntervalRef.current);
    }
    return () => clearInterval(questionCommentsIntervalRef.current);
  }, [showQuestionComments, currentQuestionId]);

  // ── Actions ──
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const text = newComment;
    setNewComment("");
    const temp = { Id: Date.now(), Text: text, SenderId: userId, SenderName: "You", CreatedAt: new Date().toISOString(), isTemp: true };
    setComments(prev => [...prev, temp]);
    try {
      await axios.post(`${API_URL}comment/add`, { PaperId: paperId, Description: text, SenderId: userId, QuestionId: null });
      refreshComments();
      showMsg("💬 Message sent!");
    } catch {
      setComments(prev => prev.filter(c => c.Id !== temp.Id));
      showMsg("Failed to send.", "error");
    }
  };

  const handleAddQuestionComment = async () => {
    if (!newQuestionComment.trim()) return;
    const text = newQuestionComment;
    setNewQuestionComment("");
    const temp = { id: Date.now(), CommentText: text, SenderId: userId, SenderName: "You", CreatedAt: new Date().toISOString(), isTemp: true };
    setQuestionComments(prev => [...prev, temp]);
    try {
      await axios.post(`${API_URL}comment/add`, { PaperId: paperId, QuestionId: currentQuestionId, Description: text, SenderId: userId });
      refreshQuestionComments(currentQuestionId);
      showMsg("💬 Message sent!");
    } catch {
      setQuestionComments(prev => prev.filter(c => c.id !== temp.id));
      showMsg("Failed to send.", "error");
    }
  };

  const startEditing = (index) => {
    const q = paperDetails.Questions[index];
    setEditingIndex(index);
    setEditForm({ text: q.Text || "", marks: q.Marks || 0, difficulty: q.DifficultyLevel || "easy", cloId: q.CloId || null });
  };

  const startExtraQuestion = () => {
    setEditingIndex("extra");
    setActiveTab(paperDetails.Questions.length);
    setEditForm({ text: "", marks: 0, difficulty: "easy", cloId: null });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm({ text: "", marks: 0, difficulty: "easy", cloId: null });
  };

  const handleEditSubmit = async () => {
    try {
      const questionData = {
        text: editForm.text,
        marks: parseInt(editForm.marks),
        difficulty_level: editForm.difficulty,
        clo_id: parseInt(editForm.cloId),
      };
      if (editingIndex === "extra") {
        questionData.paper_id = paperDetails.PaperId;
        questionData.isextra = true;
        await axios.post(`${API_URL}question/Create`, { question: JSON.stringify(questionData), isDirector: isUserDirector });
        showMsg("Extra question added successfully!");
      } else {
        const questionId = paperDetails.Questions[editingIndex].Id;
        await axios.post(`${API_URL}question/Edit/${questionId}`, { question: JSON.stringify(questionData), isDirector: isUserDirector });
        showMsg("Question updated successfully!");
      }
      await refreshPaperDetails();
      cancelEdit();
    } catch (e) {
      console.error(e);
      showMsg("Failed to save question.", "error");
    }
  };

  const handleDeleteExtraQuestion = (questionId) => {
    Alert.alert("Delete Question", "Are you sure you want to delete this extra question?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}question/Delete/${questionId}`);
            await refreshPaperDetails();
            showMsg("Extra question deleted!");
            cancelEdit();
          } catch {
            showMsg("Failed to delete.", "error");
          }
        }
      }
    ]);
  };

  const handleApproveReject = (questionId, status) => {
    Alert.alert("Confirm", `Are you sure you want to ${status} this question?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            let res;
            if (isUserDirector) {
              res = await axios.post(`${API_URL}question/director_approve_reject`, { PaperId: paperDetails.PaperId, QuestionId: questionId, UserId: userId, Status: status });
            } else {
              res = await axios.post(`${API_URL}question/approve_reject`, { PaperId: paperDetails.PaperId, QuestionId: questionId, UserId: userId, Status: status });
            }
            if (res.data.success) {
              showMsg(`Question ${status} successfully`);
              await refreshPaperDetails();
            } else {
              showMsg(res.data.message || `Failed to ${status}`, "error");
            }
          } catch {
            showMsg("Failed to update question status.", "error");
          }
        }
      }
    ]);
  };

  const handleSendToFacultyApprover = () => {
    Alert.alert("Send Paper", "Send paper to Faculty Approver?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send",
        onPress: async () => {
          try {
            await axios.post(`${API_URL}paper/sendToFacultyApprover/${paperDetails.PaperId}`);
            await refreshPaperDetails();
            showMsg("Paper sent to Faculty Approver!");
          } catch {
            showMsg("Failed to send paper.", "error");
          }
        }
      }
    ]);
  };

  const handleDirectorApprove = async () => {
    try {
      const res = await axios.post(`${API_URL}paper/directorApprove/${paperDetails.PaperId}`, { UserId: userId });
      showMsg(res.data.message || "Paper approved successfully!");
      await refreshPaperDetails();
    } catch (e) {
      showMsg(e.response?.data?.Message || "Failed to approve paper.", "error");
    }
  };

  // ── Computed ──
  const getQuestionSummary = (q) => {
    if (!q) return { approved: 0, rejected: 0, pending: 0 };
    const result = { approved: 0, rejected: 0, pending: 0 };
    (q.TeacherStatuses || []).forEach(t => {
      if (t.Status === "approved") result.approved++;
      else if (t.Status === "reject") result.rejected++;
      else result.pending++;
    });
    return result;
  };

  const getStatusBadgeStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "readyforfacultyapprover") return styles.statusWarning;
    if (s === "submitted") return styles.statusInfo;
    if (s === "approved") return styles.statusApproved;
    if (s === "waitingforfacultyapprover") return styles.statusPurple;
    return styles.statusDefault;
  };

  // ── Loading / Error ──
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary600} />
        <Text style={styles.loadingText}>Loading paper details...</Text>
      </View>
    );
  }

  if (!paperDetails) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{message || "No paper details found."}</Text>
      </View>
    );
  }

  const questions = paperDetails.Questions || [];
  const selectedQuestion = activeTab < questions.length ? questions[activeTab] : null;
  const loggedInUserId = Number(userId);
  const canEdit = createPaper || (selectedQuestion && selectedQuestion.EditorId === loggedInUserId);
  const isExtraTab = editingIndex === "extra";
  const summary = getQuestionSummary(selectedQuestion);

  const canApprove =
    (paperDetails.PaperStatus?.toLowerCase() === "waitingforfacultyapprover" && !isUserDirector) ||
    (paperDetails.PaperStatus?.toLowerCase() === "submitted" && isUserDirector);

  const showEditBtn =
    (!isExtraTab && editingIndex !== activeTab) &&
    (
      (canEdit && paperDetails?.PaperStatus !== "Submitted" && paperDetails?.PaperStatus !== "Approved") ||
      (isUserDirector && paperDetails?.PaperStatus === "Submitted")
    );

  return (
    <View style={styles.page}>
      {/* Notification */}
      {!!message && (
        <Notification message={message} type={messageType} onClose={() => setMessage("")} />
      )}

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Paper Header ── */}
        <View style={styles.paperHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.paperTitle}>{paperDetails.CourseTitle}</Text>
            <View style={styles.paperMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Course Code</Text>
                <View style={styles.metaValueBadge}><Text style={styles.metaValue}>{paperDetails.CourseCode}</Text></View>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Term</Text>
                <View style={styles.metaValueBadge}><Text style={styles.metaValue}>{paperDetails.Term}</Text></View>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.commentsButton} onPress={() => setShowComments(true)}>
              <Text style={styles.commentsButtonText}>💬 Paper Chat</Text>
            </TouchableOpacity>

            {/* Status Badge */}
            <TouchableOpacity
              style={[styles.statusBadge, getStatusBadgeStyle(paperDetails.PaperStatus)]}
              onPress={() => {
                if (createPaper && paperDetails.PaperStatus === "ReadyForFacultyApprover") handleSendToFacultyApprover();
                if (isUserDirector && paperDetails.PaperStatus === "Submitted") handleDirectorApprove();
              }}
            >
              <Text style={styles.statusBadgeText}>
                {isUserDirector && paperDetails.PaperStatus === "Submitted" ? "Approve Paper" : paperDetails.PaperStatus}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          <StatCard icon="📊" label="Total Marks" value={String(paperDetails.TotalMarks)} />
          <StatCard icon="❓" label="Questions" value={String(paperDetails.NoOfQuestions)} />
          <StatCard icon="👥" label="Teacher(s)" value={paperDetails.TeacherName} />
          <StatCard icon="🎓" label="Program" value={paperDetails.DegreePrograms || "N/A"} />
        </View>

        {/* ── Action Buttons ── */}
        {(createPaper || isUserDirector) && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowReorderModal(true)}>
              <Text style={styles.actionButtonText}>⇅ Reorder Questions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>🛡 Check Policy</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Question Tabs ── */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.questionTabs}>
            {questions.map((q, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tabBtn, activeTab === index && styles.tabBtnActive, q.IsExtra && styles.tabBtnExtra]}
                onPress={() => { setActiveTab(index); setEditingIndex(null); }}
              >
                <Text style={[styles.tabBtnText, activeTab === index && styles.tabBtnTextActive, q.IsExtra && styles.tabBtnTextExtra]}>
                  {q.IsExtra ? `Q${index + 1} ✨` : `Q${index + 1}`}
                </Text>
              </TouchableOpacity>
            ))}
            {createPaper && (
              <TouchableOpacity
                style={[styles.tabBtn, styles.tabBtnAdd, isExtraTab && styles.tabBtnActive]}
                onPress={startExtraQuestion}
              >
                <Text style={[styles.tabBtnText, isExtraTab && styles.tabBtnTextActive]}>+ Add Extra</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <View style={styles.tabStats}>
            <Text style={styles.tabStatsText}>Total: {questions.length}</Text>
          </View>
        </View>

        {/* ── Question Card ── */}
        {(selectedQuestion || isExtraTab) && (
          <View style={[styles.questionCard, editingIndex !== null && styles.questionCardEditing]}>

            {/* Card Header */}
            <View style={styles.questionCardHeader}>
              <View style={styles.questionNumberBadge}>
                <Text style={styles.questionNumberText}>
                  {isExtraTab
                    ? `Extra Q${questions.length + 1}`
                    : `Question ${activeTab + 1}${selectedQuestion?.IsExtra ? " (Extra)" : ""}`}
                </Text>
              </View>

              {/* Action buttons */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.headerActions}>
                  {showEditBtn && (
                    <TouchableOpacity style={styles.iconButton} onPress={() => startEditing(activeTab)}>
                      <Text style={styles.iconButtonText}>✏️ Edit</Text>
                    </TouchableOpacity>
                  )}
                  {!isExtraTab && editingIndex !== activeTab && canEdit && createPaper &&
                    paperDetails?.PaperStatus !== "Submitted" && paperDetails?.PaperStatus !== "Approved" && (
                      <TouchableOpacity style={styles.iconButton}>
                        <Text style={styles.iconButtonText}>+ Assign</Text>
                      </TouchableOpacity>
                    )}
                  {selectedQuestion && (
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => { setCurrentQuestionId(selectedQuestion.Id); setShowQuestionComments(true); }}
                    >
                      <Text style={styles.iconButtonText}>💬 Question Chat</Text>
                    </TouchableOpacity>
                  )}
                  {selectedQuestion && paperDetails?.PaperStatus === "WaitingForFacultyApprover" && (
                    <TouchableOpacity style={[styles.iconButton, styles.summaryBtn]} onPress={() => setShowSummaryModal(true)}>
                      <Text style={[styles.iconButtonText, { color: C.primary700 }]}>📋 Approval Status</Text>
                    </TouchableOpacity>
                  )}
                  {(createPaper || isUserDirector) && selectedQuestion?.IsExtra && !isExtraTab && editingIndex == null && paperDetails?.PaperStatus !== "Approved" && (
                    <TouchableOpacity
                      style={[styles.iconButton, styles.deleteIconBtn]}
                      onPress={() => handleDeleteExtraQuestion(selectedQuestion?.Id)}
                    >
                      <Text style={[styles.iconButtonText, { color: C.error }]}>🗑 Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Edit Form */}
            {editingIndex !== null && (editingIndex === activeTab || isExtraTab) ? (
              <View style={styles.editForm}>
                {/* Question Text */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Question Text</Text>
                  <TextInput
                    style={styles.formTextarea}
                    value={editForm.text}
                    onChangeText={(v) => setEditForm(p => ({ ...p, text: v }))}
                    multiline
                    numberOfLines={4}
                    placeholder="Enter question text..."
                    placeholderTextColor={C.gray400}
                  />
                </View>

                {/* Marks & CLO Row */}
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Marks</Text>
                    <TextInput
                      style={styles.formInput}
                      value={String(editForm.marks)}
                      onChangeText={(v) => setEditForm(p => ({ ...p, marks: parseInt(v) || 0 }))}
                      keyboardType="numeric"
                      placeholderTextColor={C.gray400}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 2, marginLeft: 12 }]}>
                    <Text style={styles.formLabel}>CLO</Text>
                    {loadingClos ? (
                      <ActivityIndicator color={C.primary600} />
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cloScroll}>
                        {clos.map(clo => (
                          <TouchableOpacity
                            key={clo.Id}
                            style={[styles.cloOption, editForm.cloId == clo.Id && styles.cloOptionSelected]}
                            onPress={() => setEditForm(p => ({ ...p, cloId: clo.Id }))}
                          >
                            <Text style={[styles.cloOptionText, editForm.cloId == clo.Id && styles.cloOptionTextSelected]} numberOfLines={2}>
                              {clo.Title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>

                {/* Difficulty */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Difficulty Level</Text>
                  <View style={styles.difficultyGroup}>
                    {["easy", "medium", "tough"].map(level => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.difficultyBtn,
                          level === "easy" && styles.diffEasy,
                          level === "medium" && styles.diffMedium,
                          level === "tough" && styles.diffTough,
                          editForm.difficulty === level && styles.diffActive,
                        ]}
                        onPress={() => setEditForm(p => ({ ...p, difficulty: level }))}
                      >
                        <Text style={[
                          styles.difficultyBtnText,
                          level === "easy" && { color: editForm.difficulty === level ? C.white : "#065f46" },
                          level === "medium" && { color: editForm.difficulty === level ? C.white : "#92400e" },
                          level === "tough" && { color: editForm.difficulty === level ? C.white : "#991b1b" },
                        ]}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Form Actions */}
                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleEditSubmit}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Question Display
              !isExtraTab && selectedQuestion && (
                <View style={styles.questionContent}>
                  <Text style={styles.questionText}>{selectedQuestion.EditedText || selectedQuestion.Text}</Text>

                  {selectedQuestion.Image && (
                    <Image
                      source={{ uri: `${BASE_URL}${selectedQuestion.Image}` }}
                      style={styles.questionImage}
                      resizeMode="contain"
                    />
                  )}

                  {/* Metadata Badges */}
                  <View style={styles.metadataRow}>
                    <View style={[styles.metaBadge, styles.marksBadge]}>
                      <Text style={styles.metaBadgeText}>📊 {selectedQuestion.Marks} marks</Text>
                    </View>
                    <View style={[styles.metaBadge,
                      selectedQuestion.DifficultyLevel === "easy" ? styles.badgeEasy :
                      selectedQuestion.DifficultyLevel === "medium" ? styles.badgeMediumDiff : styles.badgeTough
                    ]}>
                      <Text style={styles.metaBadgeText}>
                        {selectedQuestion.DifficultyLevel === "easy" ? "🟢" : selectedQuestion.DifficultyLevel === "medium" ? "🟡" : "🔴"}
                        {" "}{selectedQuestion.DifficultyLevel}
                      </Text>
                    </View>
                    <View style={[styles.metaBadge, styles.cloBadge]}>
                      <Text style={styles.metaBadgeText} numberOfLines={2}>
                        📚 {clos.find(c => c.Id === selectedQuestion.CloId)?.Title || selectedQuestion.CloId}
                      </Text>
                    </View>
                  </View>

                  {/* Approve / Reject */}
                  {canApprove && (
                    <View style={styles.approvalGroup}>
                      <TouchableOpacity
                        style={[styles.approvalBtn, styles.approveBtn, selectedQuestion.Status === "approved" && styles.approveBtnActive]}
                        onPress={() => handleApproveReject(selectedQuestion.Id, "approved")}
                      >
                        <Text style={[styles.approvalBtnText, selectedQuestion.Status === "approved" && { color: C.white }]}>✓ Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.approvalBtn, styles.rejectBtn, selectedQuestion.Status === "reject" && styles.rejectBtnActive]}
                        onPress={() => handleApproveReject(selectedQuestion.Id, "reject")}
                      >
                        <Text style={[styles.approvalBtnText, selectedQuestion.Status === "reject" && { color: C.white }]}>✗ Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Paper Chat Modal ── */}
      <ChatModal
        visible={showComments}
        title="Paper Discussion"
        messages={comments}
        userId={userId}
        newMessage={newComment}
        onChangeMessage={setNewComment}
        onSend={handleAddComment}
        onClose={() => setShowComments(false)}
      />

      {/* ── Question Chat Modal ── */}
      <ChatModal
        visible={showQuestionComments && !!selectedQuestion}
        title={`Question ${activeTab + 1} Discussion`}
        messages={questionComments}
        userId={userId}
        newMessage={newQuestionComment}
        onChangeMessage={setNewQuestionComment}
        onSend={handleAddQuestionComment}
        onClose={() => setShowQuestionComments(false)}
      />

      {/* ── Summary Modal ── */}
      <SummaryModal
        visible={showSummaryModal}
        summary={summary}
        selectedQuestion={selectedQuestion}
        onClose={() => setShowSummaryModal(false)}
      />
    </View>
  );
};

export default Question;

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f4f6f9",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f6f9",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: C.gray600,
    fontSize: 16,
  },
  errorIcon: { fontSize: 64, marginBottom: 16 },
  errorText: { color: C.gray700, fontSize: 16 },

  container: {
    padding: 16,
    paddingBottom: 40,
  },

  // ── Notification ──
  notification: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 12,
    left: 16,
    right: 16,
    zIndex: 1000,
    padding: 14,
    backgroundColor: C.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notifSuccess: { borderLeftWidth: 4, borderLeftColor: C.success },
  notifError: { borderLeftWidth: 4, borderLeftColor: C.error },
  notifContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  notifIcon: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 10 },
  notifIconSuccess: { backgroundColor: C.success },
  notifIconError: { backgroundColor: C.error },
  notifIconText: { color: C.white, fontSize: 13, fontWeight: "bold" },
  notifText: { color: C.gray800, fontSize: 14, flex: 1 },
  notifClose: { color: C.gray400, fontSize: 22, paddingHorizontal: 4 },

  // ── Paper Header ──
  paperHeader: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: C.primary100,
  },
  headerLeft: { marginBottom: 16 },
  paperTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.gray900,
    marginBottom: 12,
  },
  paperMeta: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  metaLabel: { color: C.gray500, fontSize: 12, fontWeight: "500" },
  metaValueBadge: { backgroundColor: C.gray100, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  metaValue: { color: C.gray800, fontSize: 12, fontWeight: "600" },
  headerRight: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" },
  commentsButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 10,
    backgroundColor: C.white,
  },
  commentsButtonText: { color: C.gray700, fontSize: 13, fontWeight: "500" },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusBadgeText: { fontSize: 13, fontWeight: "600" },
  statusDefault: { backgroundColor: C.gray100 },
  statusWarning: { backgroundColor: "#fef3c7" },
  statusInfo: { backgroundColor: C.primary100 },
  statusApproved: { backgroundColor: "#d1fae5" },
  statusPurple: { backgroundColor: "#ede9fe" },

  // ── Stats Grid ──
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: C.gray100,
  },
  statIcon: {
    width: 48,
    height: 48,
    backgroundColor: C.primary100,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconText: { fontSize: 24 },
  statInfo: { flex: 1 },
  statLabel: { fontSize: 11, color: C.gray500, fontWeight: "500", marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: "700", color: C.gray900 },

  // ── Action Row ──
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.primary200,
    borderRadius: 10,
  },
  actionButtonText: { color: C.primary700, fontSize: 13, fontWeight: "500" },

  // ── Tabs ──
  tabsWrapper: { marginBottom: 16 },
  questionTabs: { flexDirection: "row", gap: 8, paddingVertical: 4, paddingHorizontal: 2 },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: C.primary600, borderColor: C.primary600 },
  tabBtnExtra: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" },
  tabBtnAdd: { backgroundColor: C.primary50, borderColor: C.primary300 },
  tabBtnText: { fontSize: 13, fontWeight: "500", color: C.gray600 },
  tabBtnTextActive: { color: C.white },
  tabBtnTextExtra: { color: "#92400e" },
  tabStats: { marginTop: 8, alignItems: "flex-end" },
  tabStatsText: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: C.gray100,
    borderRadius: 20,
    fontSize: 12,
    color: C.gray600,
    fontWeight: "500",
  },

  // ── Question Card ──
  questionCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: C.gray200,
  },
  questionCardEditing: { borderTopWidth: 4, borderTopColor: C.primary500 },
  questionCardHeader: {
    padding: 16,
    backgroundColor: C.gray50,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
    gap: 12,
  },
  questionNumberBadge: {
    alignSelf: "flex-start",
    backgroundColor: C.primary50,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  questionNumberText: { color: C.primary700, fontSize: 14, fontWeight: "600" },
  headerActions: { flexDirection: "row", gap: 8 },
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 8,
  },
  iconButtonText: { fontSize: 12, fontWeight: "500", color: C.gray600 },
  summaryBtn: { borderColor: C.primary200, backgroundColor: C.primary50 },
  deleteIconBtn: { borderColor: "#fecaca" },

  // ── Question Content ──
  questionContent: { padding: 20 },
  questionText: {
    fontSize: 15,
    lineHeight: 24,
    color: C.gray800,
    marginBottom: 20,
  },
  questionImage: { width: "100%", height: 200, borderRadius: 10, marginBottom: 20 },
  metadataRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  metaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  metaBadgeText: { fontSize: 12, fontWeight: "500" },
  marksBadge: { backgroundColor: C.primary100 },
  cloBadge: { backgroundColor: C.gray100 },
  badgeEasy: { backgroundColor: "#d1fae5" },
  badgeMediumDiff: { backgroundColor: "#fef3c7" },
  badgeTough: { backgroundColor: "#fee2e2" },

  // ── Approval ──
  approvalGroup: { flexDirection: "row", gap: 10, marginTop: 8 },
  approvalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  approveBtn: { backgroundColor: "#d1fae5" },
  approveBtnActive: { backgroundColor: C.success },
  rejectBtn: { backgroundColor: "#fee2e2" },
  rejectBtnActive: { backgroundColor: C.error },
  approvalBtnText: { fontSize: 13, fontWeight: "600", color: C.gray800 },

  // ── Edit Form ──
  editForm: { padding: 20 },
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 13, fontWeight: "600", color: C.gray700, marginBottom: 8 },
  formTextarea: {
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: C.gray800,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: C.white,
  },
  formInput: {
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: C.gray800,
    backgroundColor: C.white,
  },
  formRow: { flexDirection: "row", marginBottom: 0 },
  cloScroll: { maxHeight: 48 },
  cloOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: C.white,
    maxWidth: 140,
  },
  cloOptionSelected: { borderColor: C.primary500, backgroundColor: C.primary50 },
  cloOptionText: { fontSize: 12, color: C.gray700 },
  cloOptionTextSelected: { color: C.primary700, fontWeight: "600" },
  difficultyGroup: { flexDirection: "row", gap: 10 },
  difficultyBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: C.white,
  },
  diffEasy: { borderColor: "#10b981" },
  diffMedium: { borderColor: "#f59e0b" },
  diffTough: { borderColor: "#ef4444" },
  diffActive: { opacity: 1 },
  difficultyBtnText: { fontSize: 13, fontWeight: "500" },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.gray100,
    borderWidth: 1,
    borderColor: C.gray200,
  },
  cancelButtonText: { color: C.gray700, fontWeight: "500", fontSize: 14 },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.primary600,
  },
  saveButtonText: { color: C.white, fontWeight: "600", fontSize: 14 },

  // ── Chat Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  chatModalContainer: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    minHeight: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: C.primary600,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chatLiveIndicator: { color: "#34d399", fontSize: 11, fontWeight: "bold", marginBottom: 2 },
  chatTitle: { color: C.white, fontSize: 17, fontWeight: "600" },
  chatCloseBtn: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  chatCloseBtnText: { color: C.white, fontSize: 16 },
  chatBody: { flex: 1, padding: 16 },
  chatBodyContent: { gap: 8, paddingBottom: 8 },
  noMessages: { color: C.gray400, textAlign: "center", marginTop: 24 },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  sentBubble: { backgroundColor: C.primary100, alignSelf: "flex-end" },
  receivedBubble: { backgroundColor: C.gray100, alignSelf: "flex-start" },
  messageSender: { fontSize: 11, fontWeight: "600", color: C.gray500, marginBottom: 3 },
  messageText: { fontSize: 14, color: C.gray800, lineHeight: 20 },
  messageTime: { fontSize: 10, color: C.gray400, marginTop: 4, textAlign: "right" },
  chatFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: C.gray800,
    maxHeight: 80,
    backgroundColor: C.gray50,
  },
  sendBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: C.primary600,
    borderRadius: 12,
  },
  sendBtnText: { color: C.white, fontWeight: "600", fontSize: 14 },

  // ── Summary Modal ──
  summaryModalContainer: {
    backgroundColor: C.white,
    borderRadius: 24,
    width: "92%",
    maxWidth: 560,
    maxHeight: "85%",
    overflow: "hidden",
    alignSelf: "center",
    marginTop: "auto",
    marginBottom: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  summaryHeader: {
    backgroundColor: C.primary600,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  summaryHeaderIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryHeaderTitle: { color: C.white, fontSize: 18, fontWeight: "600" },
  summaryCloseBtn: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  summaryCloseBtnText: { color: C.white, fontSize: 16 },
  summaryBody: { padding: 20, maxHeight: 500 },
  summaryStatsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryStatCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderTopWidth: 3,
  },
  summaryStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  summaryStatIconText: { fontSize: 22, fontWeight: "700" },
  summaryStatValue: { fontSize: 28, fontWeight: "700", marginBottom: 2 },
  summaryStatLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  progressContainer: {
    backgroundColor: C.gray50,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.gray200,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  progressLabel: { fontSize: 12, fontWeight: "600", color: C.gray600, textTransform: "uppercase", letterSpacing: 0.5 },
  progressPercentBadge: {
    backgroundColor: C.white,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  progressPercent: { fontSize: 17, fontWeight: "700", color: C.primary600 },
  progressTrack: {
    height: 10,
    backgroundColor: C.gray200,
    borderRadius: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.primary500,
    borderRadius: 20,
  },
  teacherSection: { marginTop: 4 },
  teacherSectionTitle: { fontSize: 14, fontWeight: "600", color: C.gray800, marginBottom: 14 },
  teacherItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eef2f6",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 10,
  },
  teacherLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  teacherInitial: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.primary600,
    alignItems: "center",
    justifyContent: "center",
  },
  teacherInitialText: { color: C.white, fontSize: 16, fontWeight: "700" },
  teacherName: { fontSize: 14, fontWeight: "600", color: C.gray900 },
  teacherRole: { fontSize: 10, color: C.gray400, textTransform: "uppercase", letterSpacing: 0.3 },
  teacherStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeApproved: { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" },
  badgeRejected: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  badgePending: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  teacherStatusText: { fontSize: 12, fontWeight: "600" },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: C.gray50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.gray200,
    borderStyle: "dashed",
  },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.6 },
  emptyText: { fontSize: 15, fontWeight: "500", color: C.gray600, marginBottom: 6 },
  emptySubtext: { fontSize: 12, color: C.gray400, textAlign: "center" },
});
