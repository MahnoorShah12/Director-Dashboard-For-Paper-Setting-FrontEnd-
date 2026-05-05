import React, { useState, useEffect, useRef } from "react";


import { useRoute, useNavigation } from "@react-navigation/native";
import {
 
  KeyboardAvoidingView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
  Dimensions,
  FlatList, // Added FlatList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { diffChars } from "diff";
import DiffMatchPatch from "diff-match-patch";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
 import { launchImageLibrary } from "react-native-image-picker";
import AssignQuestionModal from "./AssignQuestionModal";
import ReorderQuestionsModal from "./ReorderQuestionsModal";
import CheckPolicyModal from "./CheckPolicyModal";
import { BASE_URL } from "../../../../../config/Api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CreateQuestion = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const paperId = route?.params?.paperId;
  const [paperDetails, setPaperDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editForm, setEditForm] = useState({
    text: "",
    marks: 0,
    difficulty: "easy",
    cloId: null,
    image: null,
    currentImage: null,
    imagePreview: null,
    removeCurrentImage: false,
  });
  const [Name, setName] = useState("");
  const [roles, setRoles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [course, setCourse] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [clos, setClos] = useState([]);
  const [loadingClos, setLoadingClos] = useState(true);
  const [createPaper, setCreatePaper] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showAssignQuestionModal, setShowAssignQuestionModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [questionComments, setQuestionComments] = useState([]);
  const [newQuestionComment, setNewQuestionComment] = useState("");
  const [showQuestionComments, setShowQuestionComments] = useState(false);
  const [loadingQuestionComments, setLoadingQuestionComments] = useState(false);
  const commentsScrollRef = useRef(null);
  const questionCommentsScrollRef = useRef(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  
  // New state to handle CLO Selection List
  const [showCloListModal, setShowCloListModal] = useState(false); 
  
  const [policyStatus, setPolicyStatus] = useState(null);
  const [isUserDirector, setIsUserDirector] = useState(false);
  const [cloSearch, setCloSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  console.log(searchText);
console.log(filteredClos);
  // Use HTTPS if necessary for local dev
 const baseUrl = "http://192.168.31.125/fypProject";








// const HighlightedText = ({ original = "", edited = "" }) => {
//   const dmp = new DiffMatchPatch();

//   // safety check
//   const oldText = typeof original === "string" ? original : "";
//   const newText = typeof edited === "string" ? edited : "";

//   if (!oldText || oldText === newText) {
//     return <Text style={styles.normalText}>{newText}</Text>;
//   }

//   const diffs = dmp.diff_main(oldText, newText);
//   dmp.diff_cleanupSemantic(diffs);

//   return (
//     <Text style={styles.normalText}>
//       {diffs.map((part, index) => {
//         const type = part[0];
//         const text = part[1];

//         if (!text) return null;

//         if (type === 0) {
//           return <Text key={index}>{text}</Text>;
//         }

//         if (type === 1) {
//           return (
//             <Text key={index} style={styles.boldText}>
//               {text}
//             </Text>
//           );
//         }

//         if (type === -1) {
//           return (
//             <Text key={index} style={styles.strikeText}>
//               {text}
//             </Text>
//           );
//         }

//         return null;
//       })}
//     </Text>
//   );
// };


const HighlightedText = ({ original = "", edited = "" }) => {
  const dmp = new DiffMatchPatch();

  const oldText = typeof original === "string" ? original : "";
  const newText = typeof edited === "string" ? edited : "";

  if (!oldText || oldText === newText) {
    return (
      <View style={styles.diffBox}>
        <Text style={styles.normalText}>{newText}</Text>
      </View>
    );
  }

  const diffs = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(diffs);

  return (
    <View style={styles.diffBox}>
      <Text style={styles.normalText}>
        {diffs.map((part, index) => {
          const type = part[0];
          const text = part[1];

          if (!text) return null;

          // UNCHANGED
          if (type === 0) {
            return <Text key={index}>{text}</Text>;
          }

          // ADDED (YELLOW HIGHLIGHT)
          if (type === 1) {
            return (
              <Text key={index} style={styles.addedText}>
                {text}
              </Text>
            );
          }

          // REMOVED (RED STRIKE + LIGHT BACKGROUND)
          if (type === -1) {
            return (
              <Text key={index} style={styles.removedText}>
                {text}
              </Text>
            );
          }

          return null;
        })}
      </Text>
    </View>
  );
};
 const isQuestionLocked =
  selectedQuestion?.Status === "approved" ||
  selectedQuestion?.Status === "rejected";

  console.log("Questions:", questions);

console.log("ActiveTab:", activeTab);

const filteredClos = (clos || []).filter(item =>
  (item?.Title || "").toLowerCase().includes(searchText.toLowerCase())
);
  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments]);

  useEffect(() => {
    if (showComments && comments.length > 0) {
      commentsScrollRef.current && commentsScrollRef.current.scrollToEnd({ animated: true });
    }
  }, [comments, showComments]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await axios.get(`${BASE_URL}/comment/get_by_paper/${paperId}`);
      setComments(response.data || []);
      setLoadingComments(false);
    } catch (error) {
      setMessage("Failed to load comments.");
      setMessageType("error");
      setLoadingComments(false);
    }
  };
 const imageUri =
  editForm.imagePreview
    ? editForm.imagePreview
    : editForm.currentImage
    ? `${baseUrl}${editForm.currentImage}`
    : null;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`${BASE_URL}/comment/add`, {
        PaperId: paperId,
        Description: newComment,
        SenderId: userId,
        QuestionId: null,
      });
      setNewComment("");
      fetchComments();
      setMessage("Comment added successfully!");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } catch (error) {
      setMessage("Failed to add comment.");
      setMessageType("error");
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const storedUserId = await AsyncStorage.getItem("user_id");
      const storedName = await AsyncStorage.getItem("user_name");
      const storedRolesRaw = await AsyncStorage.getItem("user_roles");
      const storedRoles = storedRolesRaw ? JSON.parse(storedRolesRaw) : [];
      const normalizedRoles = storedRoles.map((r) => r.toLowerCase());
      setName(storedName || "Guest");
      setRoles(normalizedRoles);
      setUserId(storedUserId ? parseInt(storedUserId, 10) : null);
      setIsUserDirector(normalizedRoles.includes("director"));
    };
    loadUser();
  }, []);

  const fetchQuestionComments = async (questionId) => {
    try {
      setLoadingQuestionComments(true);
      const response = await axios.get(`${BASE_URL}/comment/get_by_question/${questionId}`);
      setQuestionComments(response.data || []);
      setLoadingQuestionComments(false);
    } catch (error) {
      setMessage("Failed to load question comments.");
      setMessageType("error");
      setLoadingQuestionComments(false);
    }
  };

  const handleAddQuestionComment = async (questionId) => {
    if (!newQuestionComment.trim()) return;
    try {
      await axios.post(`${BASE_URL}/comment/add`, {
        PaperId: paperId,
        QuestionId: questionId,
        Description: newQuestionComment,
        SenderId: userId,
      });
      setNewQuestionComment("");
      fetchQuestionComments(questionId);
      setMessage("Comment added successfully!");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } catch (error) {
      setMessage("Failed to add comment.");
      setMessageType("error");
    }
  };

  useEffect(() => {
    const fetchPaperDetails = async () => {
      try {
        setLoading(true);
        const storedUserId = await AsyncStorage.getItem("user_id");
        if (!storedUserId) {
          navigation.navigate("Login");
          return;
        }
        const response = await axios.get(`${BASE_URL}/paper/GetPaperDetails/${paperId}`);
        if (!response.data || !response.data.PaperId) {
          navigation.navigate("Error");
          return;
        }
        const cid = response.data.CourseId;
        setCourseId(cid);
        await fetchCourseForUser(storedUserId, cid);
        setPaperDetails(response.data);
        setActiveTab(0);
        setLoading(false);
      } catch (error) {}
    };
    fetchPaperDetails();
  }, [paperId]);

  // Updated Fetch CLOs to map exactly like JS
  useEffect(() => {
    if (!courseId) return;
    const fetchCLOs = async () => {
      try {
        setLoadingClos(true);
        const response = await axios.get(`${BASE_URL}/clos/get_Clos/${courseId}`);
        const cloArray = response.data.map(clo => ({
            Id: clo.id,
            Title: clo.description
        }));
        setClos(cloArray);
        setLoadingClos(false);
      } catch (err) {
        setLoadingClos(false);
      }
    };
    fetchCLOs();
  }, [courseId]);

  const fetchCourseForUser = async (userIdLocal, courseIdLocal) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/paper/verify-teacher-teach-course/${userIdLocal}?courseId=${courseIdLocal}`
      );
      const storedRolesRaw = await AsyncStorage.getItem("user_roles");
      const storedRoles = storedRolesRaw ? JSON.parse(storedRolesRaw) : [];
      const isDirectorLocal = storedRoles.map((r) => r.toLowerCase()).includes("director");
      if (!response.data.Course && !isDirectorLocal) {
        navigation.navigate("Unauthorized");
        return;
      }
      setCourse(response.data.Course || {});
      setCreatePaper(response.data.CreatePaper || false);
    } catch (error) {
      const storedRolesRaw = await AsyncStorage.getItem("user_roles");
      const storedRoles = storedRolesRaw ? JSON.parse(storedRolesRaw) : [];
      const isDirectorLocal = storedRoles.map((r) => r.toLowerCase()).includes("director");
      if (isDirectorLocal) {
        setCourse({});
        setCreatePaper(false);
        return;
      }
      if (error.response?.status === 401) {
        navigation.navigate("Login");
      } else {
        navigation.navigate("Unauthorized");
      }
    }
  };

//   const removeImage = () => {
//    setEditForm((prev) => ({
//   ...prev,
//   image: {
//     uri: file.uri,
//     type: file.type || "image/jpeg",
//     name: file.fileName || `photo_${Date.now()}.jpg`,
//   },
//   imagePreview: file.uri,
//   removeCurrentImage: false,
// }));
//   };
const removeImage = () => {
  setEditForm((prev) => ({
    ...prev,
    image: null,
    imagePreview: null,
    currentImage: null,
    removeCurrentImage: true,
  }));
};

  const startEditing = (index) => {
    const question = paperDetails.Questions[index];
    setEditingIndex(index);
    setEditForm({
      text: question.Text || "",
      marks: question.Marks || 0,
      difficulty: question.DifficultyLevel || "easy",
      cloId: question.CloId || null,
      image: null,
      imagePreview: null,
      currentImage: question.Image || null,
      removeCurrentImage: false,
    });
    setActiveTab(index);
  };

  const startExtraQuestion = () => {
    setEditingIndex("extra");
    setActiveTab(paperDetails.Questions.length);
    setEditForm({
      text: "",
      marks: 0,
      difficulty: "easy",
      cloId: null,
      image: null,
      imagePreview: null,
      currentImage: null,
      removeCurrentImage: false,
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm({
      text: "",
      marks: 0,
      difficulty: "easy",
      cloId: null,
      image: null,
      imagePreview: null,
      currentImage: null,
      removeCurrentImage: false,
    });
  };

  // Updated handleEditSubmit with proper FormData for Native
  const handleEditSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      // const questionData = {
      //   text: editForm.text,
      //   marks: parseInt(editForm.marks),
      //   difficulty_level: editForm.difficulty,
      //   clo_id: editForm.cloId ? parseInt(editForm.cloId) : null,
      // };
const questionData = {
  text: editForm.text,
  marks: parseInt(editForm.marks),
  difficulty_level: editForm.difficulty,
  clo_id: editForm.cloId ? parseInt(editForm.cloId) : null,
  editedByDirector: isUserDirector, // 👈 ADD THIS
};
      if (editingIndex === "extra") {
        questionData.paper_id = paperDetails.PaperId;
        questionData.isextra = true;
      }

      formDataToSend.append("question", JSON.stringify(questionData));
      formDataToSend.append("isDirector", isUserDirector ? "true" : "false");

      if (editForm.image) {
        formDataToSend.append("image", {
          uri: Platform.OS === "android" ? editForm.image.uri : editForm.image.uri.replace("file://", ""),
          name: editForm.image.fileName || "photo.jpg",
          type: editForm.image.type || "image/jpeg",
        });
      }

      if (editForm.removeCurrentImage) {
        formDataToSend.append("removeImage", "true");
      }

      let response;
      if (editingIndex === "extra") {
        response = await axios.post(`${BASE_URL}/question/Create`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPaperDetails((prev) => ({
          ...prev,
          Questions: [
            ...prev.Questions,
            {
              Id: response.data.QuestionId,
              Text: editForm.text,
              Marks: editForm.marks,
              DifficultyLevel: editForm.difficulty,
              CloId: editForm.cloId,
              Image: editForm.image ? response.data.imagePath : null,
            },
          ],
        }));
        setMessage("Extra question added successfully!");
      } else {
        const questionId = paperDetails.Questions[editingIndex].Id;
        response = await axios.post(`${BASE_URL}/question/Edit/${questionId}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPaperDetails((prev) => {
          const updatedQuestions = [...prev.Questions];
          updatedQuestions[editingIndex] = response.data;
          return { ...prev, Questions: updatedQuestions };
        });
        setMessage("Question updated successfully!");
      }
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      cancelEdit();
    } catch (error) {
      setMessage("Failed to save question.");
      setMessageType("error");
    }
  };

  const handleDeleteExtraQuestion = (questionId) => {
    Alert.alert("Confirm", "Are you sure you want to delete this extra question?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/question/Delete/${questionId}`);
            setPaperDetails((prev) => ({
              ...prev,
              Questions: prev.Questions.filter((q) => q.Id !== questionId),
            }));
            setMessage("Extra question deleted successfully!");
            setMessageType("success");
            setTimeout(() => setMessage(""), 3000);
            cancelEdit();
          } catch (err) {
            setMessage("Failed to delete extra question.");
            setMessageType("error");
          }
        },
      },
    ]);
  };

  const requestImagePermission = async () => {
    if (Platform.OS !== "android") return true;
    try {
        // Updated for modern Android permissions
        return true; 
    } catch (e) {
      return false;
    }
  };

  const handleImageChange = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;
    const result = await launchImageLibrary({ mediaType: "photo", quality: 0.8 });
    if (result?.assets && result.assets.length > 0) {
      const file = result.assets[0];
      setEditForm((prev) => ({ ...prev, image: file, imagePreview: file.uri, removeCurrentImage: false }));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.headerTitle}>Paper Information</Text>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading paper details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!paperDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.headerTitle}>Paper Information</Text>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{message || "No paper details found."}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const questions = paperDetails.Questions || [];
  const selectedQuestion = activeTab < questions.length ? questions[activeTab] : null;
 
const safeText = (val) =>
  typeof val === "string" || typeof val === "number"
    ? String(val)
    : "";
const original = selectedQuestion?.EditedText ?? "";
const edited = selectedQuestion?.Text ?? "";
const isEdited = selectedQuestion?.IsEdited === true;


console.log("ORIGINAL:", selectedQuestion?.EditedText || "");
console.log("EDITED:", selectedQuestion?.Text);
  const loggedInUserId = Number(userId);
  // const canEdit = createPaper || (selectedQuestion && selectedQuestion.EditorId === loggedInUserId);
  const canEdit = createPaper || isUserDirector || (selectedQuestion && selectedQuestion.EditorId === loggedInUserId);
  const isExtraTab = editingIndex === "extra";

  const handleSaveReorder = async (newOrder) => {
    try {
      const newOrderIds = newOrder.map((q) => q.Id);
      await axios.post(`${BASE_URL}/paper/ReorderQuestionsNoOrder/${paperId}`, newOrderIds);
      setPaperDetails((prev) => ({ ...prev, Questions: newOrder }));
      setShowReorderModal(false);
      setMessage("Questions reordered successfully!");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } catch (error) {
      setMessage("Failed to save reordered questions.");
      setMessageType("error");
    }
  };

  const handleSendToFacultyApprover = () => {
    if (!createPaper) return;
    if (paperDetails.PaperStatus !== "ReadyForFacultyApprover") return;
    Alert.alert("Confirm", "Send paper to Faculty Approver?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send",
        onPress: async () => {
          try {
            const response = await axios.post(`${BASE_URL}/paper/sendToFacultyApprover/${paperDetails.PaperId}`);
            setPaperDetails((prev) => ({ ...prev, PaperStatus: response.data?.PaperStatus || "getFacultyApprover" }));
            setMessage("Paper sent to Faculty Approver successfully!");
            setMessageType("success");
            setTimeout(() => {
              setMessage("");
              setMessageType("");
            }, 3000);
          } catch (error) {
            setMessage("Failed to send paper to Faculty Approver.");
            setMessageType("error");
          }
        },
      },
    ]);
  };

  const handleDirectorApprove = async () => {
    try {
      await axios.post(`${BASE_URL}/paper/directorApprove/${paperDetails.PaperId}`);
      setPaperDetails((prev) => ({ ...prev, PaperStatus: "Approved" }));
    } catch (error) {}
  };

  const handleApproveReject = (questionId, status) => {
    Alert.alert("Confirm", `Are you sure you want to ${status} this question?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: status.charAt(0).toUpperCase() + status.slice(1),
        onPress: async () => {
          try {
            const response = await axios.post(`${BASE_URL}/question/approve_reject`, {
              PaperId: paperDetails.PaperId,
              QuestionId: questionId,
              UserId: userId,
              Status: status,
            });
            setMessage(response.data.message || `Question ${status} successfully`);
            setMessageType("success");
            setPaperDetails((prev) => {
              const updatedQuestions = prev.Questions.map((q) => (q.Id === questionId ? { ...q, Status: status } : q));
              return { ...prev, Questions: updatedQuestions };
            });
            setTimeout(() => {
              setMessage("");
              setMessageType("");
            }, 3000);
          } catch (error) {
            setMessage("Failed to update question status.");
            setMessageType("error");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Paper Settings</Text>
        </View>

        {message ? (
          <View style={[styles.notification, messageType === "success" ? styles.successNotif : styles.errorNotif]}>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationIcon}>{messageType === "success" ? "✓" : "✕"}</Text>
              <Text style={styles.notificationText}>{message}</Text>
            </View>
            <TouchableOpacity onPress={() => setMessage("")}>
              <Text style={styles.notificationClose}>×</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <ScrollView
          style={styles.paperContainer}
          contentContainerStyle={styles.paperContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.paperHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.paperTitle}>{paperDetails.CourseTitle}</Text>
              <View style={styles.paperMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Course Code:</Text>
                  <Text style={styles.metaValue}>{paperDetails.CourseCode}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Term:</Text>
                  <Text style={styles.metaValue}>{paperDetails.Term}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.statusBadge,
                createPaper && paperDetails.PaperStatus === "ReadyForFacultyApprover" ? styles.clickableStatus : null,
                isUserDirector && paperDetails.PaperStatus === "Submitted" ? styles.directorApproveBtn : null,
              ]}
              onPress={() => {
               if (createPaper && 
   (paperDetails.PaperStatus === "ReadyForFacultyApprover" 
    || paperDetails.PaperStatus === "Creation"))
{
   handleSendToFacultyApprover();
} handleSendToFacultyApprover();
                if (isUserDirector && paperDetails.PaperStatus === "Submitted") handleDirectorApprove();
              }}
            >
              <Text style={styles.statusText}>
                {isUserDirector && paperDetails.PaperStatus === "Submitted" ? "Approve Paper" : paperDetails.PaperStatus}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paperStats}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📊</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Total Marks</Text>
                <Text style={styles.statValue}>{paperDetails.TotalMarks}</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>❓</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Questions</Text>
                <Text style={styles.statValue}>{paperDetails.NoOfQuestions}</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Teacher(s)</Text>
                <Text style={styles.statValue}>{paperDetails.TeacherName}</Text>
              </View>
            </View>

   <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎓</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Program</Text>
                <Text style={styles.statValue}>{paperDetails.DegreePrograms || "N/A"}</Text>
              </View>
            </View>


           

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.commentBtn} onPress={() => setShowComments(true)}>
                <Text>📝</Text>
                <Text style={styles.commentText}>Comments</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            style={styles.questionTabs}
            contentContainerStyle={styles.questionTabsContent}
            showsHorizontalScrollIndicator={false}
          >
            {questions.map((q, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tabBtn, activeTab === index ? styles.tabActive : null, q.IsExtra ? styles.extraQuestionTab : null]}
                onPress={() => setActiveTab(index)}
              >
                <Text style={styles.tabText}>{q.IsExtra ? `Q${index + 1} (Extra)` : `Q${index + 1}`}</Text>
              </TouchableOpacity>
            ))}

            {createPaper && (
              <TouchableOpacity style={[styles.tabBtn, isExtraTab ? styles.tabActive : null]} onPress={startExtraQuestion}>
                <Text style={styles.tabText}>+ Extra</Text>
              </TouchableOpacity>
            )}

            {(createPaper || isUserDirector) && (
              <TouchableOpacity style={styles.reorderBtn} onPress={() => setShowReorderModal(true)}>
                <Text style={styles.reorderTextBtn}>Reorder Questions</Text>
              </TouchableOpacity>
            )}

            {(createPaper || isUserDirector) && (
              <TouchableOpacity style={styles.reorderBtn} onPress={() => setShowPolicyModal(true)}>
                <Text style={styles.reorderTextBtn}>Check Policy</Text>
              </TouchableOpacity>
            )}
<TouchableOpacity
  style={styles.reorderBtn}
  onPress={() =>
    navigation.navigate("Solution", {
      paperId: paperDetails.PaperId,
filePath: paperDetails.PaperSolution,
      
   createPaper: true,
    })
  }
>
  <Text style={styles.reorderTextBtn}>Go to Solution</Text>
</TouchableOpacity>
            <Text style={styles.totalQuestions}>Total: {questions.length}</Text>
          </ScrollView>

          <View style={styles.questionsGrid}>
            {(selectedQuestion || isExtraTab) && (
              <View style={[styles.questionCard, editingIndex !== null ? styles.editingCard : null]}>
                <View style={styles.questionCardHeader}>
                  <Text style={styles.questionNumber}>
                    {isExtraTab ? `Extra Q${questions.length + 1}` : `Q${activeTab + 1}${selectedQuestion?.IsExtra ? " (Extra)" : ""}`}
                  </Text>
                  <View style={styles.leftActions}>
                    {!isExtraTab && editingIndex !== activeTab && canEdit && (
                      <TouchableOpacity  style={[
    styles.editButton,
    isQuestionLocked && { opacity: 0.5 }
  ]} onPress={() => startEditing(activeTab)}
                       disabled={isQuestionLocked}>
                        <Text style={styles.editButtonText}>Edit</Text>
                   
                      </TouchableOpacity>
                    )}

                    {!isExtraTab && editingIndex !== activeTab && canEdit && createPaper && (
                      <TouchableOpacity style={styles.reorderBtn} onPress={() => setShowAssignQuestionModal(true)}>
                        <Text style={styles.reorderTextBtn}>Assign Question</Text>
                      </TouchableOpacity>
                    )}

                    {selectedQuestion && (
                      <TouchableOpacity
                        style={styles.commentBtn}
                        onPress={() => {
                          fetchQuestionComments(selectedQuestion.Id);
                          setShowQuestionComments(true);
                        }}
                      >
                        <Text>📝</Text>
                        <Text style={styles.commentText}>Comments</Text>
                      </TouchableOpacity>
                    )}

                    {(createPaper || isUserDirector) && selectedQuestion?.IsExtra && !isExtraTab && editingIndex == null && (
                      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteExtraQuestion(selectedQuestion?.Id)}>
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {editingIndex !== null && (editingIndex === activeTab || isExtraTab) ? (
                  <View style={styles.editForm}>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Question Text</Text>
                      <TextInput
                        style={styles.textarea}
                        multiline
                        numberOfLines={4}
                        value={editForm.text}
                        onChangeText={(text) => setEditForm((prev) => ({ ...prev, text }))}
                        placeholder="Enter question text"
                      />
                    </View>

                    <View style={styles.formRow}>
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Marks</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={String(editForm.marks)}
                          onChangeText={(val) => setEditForm((prev) => ({ ...prev, marks: val }))}
                          placeholder="Marks"
                        />
                      </View>


                      {/* Updated CLO Picker to open Modal */}
                      <View style={styles.formGroup}>

                        {/* <TextInput
  placeholder="Search CLO..."
  value={cloSearch}
  onChangeText={setCloSearch}
  placeholderTextColor={"brown"}

  style={styles.input}
/> */}
                        <Text style={styles.label}>CLO</Text>
                        {loadingClos ? (
                          <Text>Loading CLOs...</Text>
                        ) : (
                          <TouchableOpacity 
                            style={styles.selectOption}
                            onPress={() => setShowCloListModal(true)}
                          >
                            <Text>{editForm.cloId ? (clos.find((c) => c.Id === editForm.cloId)?.Title || editForm.cloId) : "Select CLO"}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Difficulty Level</Text>
                      <View style={styles.difficultySelector}>
                        {["easy", "medium", "tough"].map((level) => (
                          <TouchableOpacity key={level} style={[styles.difficultyBtn, editForm.difficulty === level ? styles.difficultyActive : null]} onPress={() => setEditForm((prev) => ({ ...prev, difficulty: level }))}>
                            <Text>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Question Image (Optional)</Text>
                      <View style={styles.imageUpload}>
                        {(editForm.imagePreview || editForm.currentImage) && (
                          <View style={styles.imagePreview}>
  
{imageUri && (
  <Image
    source={{ uri: imageUri }}
    style={styles.previewImg}
  />
)}
                            <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage}><Text style={styles.removeImageText}>×</Text></TouchableOpacity>
                          </View>
                        )}
                        <View style={styles.uploadArea}>
                          <TouchableOpacity onPress={handleImageChange} style={styles.uploadLabel}>
                            <Text style={styles.uploadLabelText}>Choose Image</Text>
                          </TouchableOpacity>
                          <Text style={styles.uploadHint}>PNG, JPG up to 5MB</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.editActions}>
                      <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}><Text>Cancel</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.saveBtn} onPress={handleEditSubmit}><Text style={styles.saveText}>Save Changes</Text></TouchableOpacity>
                    </View>
                  </View>
                  
                ) : (
                  !isExtraTab &&
                  selectedQuestion && (
                    <View style={styles.questionContent}>
                 
{selectedQuestion?.IsEdited ? (
  <HighlightedText
    original={safeText(selectedQuestion?.EditedText)}
    edited={safeText(selectedQuestion?.Text)}
  />
) : (
  <Text style={styles.questionText}>
    {safeText(selectedQuestion?.Text)}
  </Text>
)}

        {selectedQuestion.Image && (
                        <View style={styles.questionImageContainer}>
                         
                          <Image 
  source={{ 
    uri: selectedQuestion.Image?.startsWith("http")
      ? selectedQuestion.Image
      : `${baseUrl}${selectedQuestion.Image}` 
  }} 
  style={styles.questionImage}
/>
                        </View>
                      )}
                      <View style={styles.questionTags}>
                        <Text style={[styles.tag, styles.marksTag]}>{selectedQuestion.Marks} marks</Text>
                        <Text style={[styles.tag, selectedQuestion.DifficultyLevel === "easy" ? styles.difficultyEasy : selectedQuestion.DifficultyLevel === "medium" ? styles.difficultyMedium : styles.difficultyTough]}>
                          {selectedQuestion.DifficultyLevel}
                        </Text>
                        <Text style={[styles.tag, styles.cloTag]}>{clos.find((c) => c.Id === selectedQuestion.CloId)?.Title || selectedQuestion.CloId}</Text>

                        {(((paperDetails.PaperStatus?.toLowerCase() === "waitingforfacultyapprover") && !isUserDirector) || ((paperDetails.PaperStatus?.toLowerCase() === "submitted") && isUserDirector)) && (
                          <View style={styles.approvalActions}>
                            <TouchableOpacity style={styles.approveBtn} onPress={() => handleApproveReject(selectedQuestion.Id, "approved")}><Text>✅ Approve</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleApproveReject(selectedQuestion.Id, "reject")}><Text>❌ Reject</Text></TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  )
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* MODAL FOR CLO SELECTION (Native Picker Replacement) */}
        <Modal visible={showCloListModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.cloModalContainer}>
                                <TextInput
  value={searchText}
  onChangeText={setSearchText}
  placeholder="Serach Clos"
  placeholderTextColor={"brown"}
/>
     
                    <Text style={styles.modalTitle}>Select CLO</Text>
                     {/* <FlatList
                        data={filteredClos}
                        keyExtractor={item => item.Id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity 
                                style={styles.cloListItem}
                                onPress={() => {
                                    setEditForm(p => ({...p, cloId: item.Id}));
                                    setShowCloListModal(false);
                                }}
                            > */}

                            <FlatList
  data={filteredClos || []}
  keyExtractor={(item) => item?.Id?.toString() || Math.random().toString()}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={styles.cloListItem}
      onPress={() => {
        setEditForm(p => ({ ...p, cloId: item?.Id }));
        setShowCloListModal(false);
      }}
    >
                                <Text>{item.Title}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCloListModal(false)}>
                        <Text>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

        <ReorderQuestionsModal visible={showReorderModal} questions={paperDetails.Questions} onClose={() => setShowReorderModal(false)} onSave={handleSaveReorder} />
        <AssignQuestionModal visible={showAssignQuestionModal} paperId={paperDetails.PaperId} selectedQuestionId={selectedQuestion?.Id} courseId={courseId} onClose={() => setShowAssignQuestionModal(false)} />

        {/* PAPER COMMENTS MODAL */}
        <Modal visible={showComments} animationType="slide" transparent>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.commentsOverlay}>
            <View style={styles.commentsModal}>
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>Paper Comments</Text>
                <TouchableOpacity onPress={() => setShowComments(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView ref={commentsScrollRef} style={styles.commentsBody} contentContainerStyle={{ paddingBottom: 16 }}>
                {loadingComments ? <Text>Loading comments...</Text> : comments.length === 0 ? <Text style={styles.noComments}>No comments yet.</Text> : comments.map((c, i) => {
                  const isSender = c.SenderId === userId;
                  return (
                    <View key={i} style={[styles.commentItem, isSender ? styles.sent : styles.received]}>
                      <Text style={styles.commentUser}>{c.SenderName}</Text>
                      <Text style={styles.commentText}>{c.Text}</Text>
                      <Text style={styles.commentDate}>{c.CreatedAt ? new Date(c.CreatedAt).toLocaleString() : "Unknown"}</Text>
                    </View>
                  );
                })}
              </ScrollView>
              <View style={styles.commentsFooter}>
                <TextInput style={styles.commentInput} multiline value={newComment} onChangeText={setNewComment} placeholder="Write a comment..." />
                <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}><Text style={styles.sendBtnText}>Send</Text></TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* QUESTION COMMENTS MODAL */}
        <Modal visible={showQuestionComments} animationType="slide" transparent>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.commentsOverlay}>
            <View style={styles.commentsModal}>
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>{`Comments for Q${activeTab + 1}`}</Text>
                <TouchableOpacity onPress={() => setShowQuestionComments(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView ref={questionCommentsScrollRef} style={styles.commentsBody} contentContainerStyle={{ paddingBottom: 16 }}>
                {loadingQuestionComments ? <Text>Loading comments...</Text> : questionComments.length === 0 ? <Text style={styles.noComments}>No comments yet.</Text> : questionComments.map((c, i) => {
                  const isSender = c.SenderId === userId;
                  return (
                    <View key={i} style={[styles.commentItem, isSender ? styles.sent : styles.received]}>
                      <Text style={styles.commentUser}>{c.SenderName}</Text>
                      <Text style={styles.commentText}>{c.CommentText}</Text>
                      <Text style={styles.commentDate}>{c.CommentDate ? new Date(c.CommentDate).toLocaleString() : "Unknown"}</Text>
                    </View>
                  );
                })}
              </ScrollView>
              <View style={styles.commentsFooter}>
                <TextInput style={styles.commentInput} multiline value={newQuestionComment} onChangeText={setNewQuestionComment} placeholder="Write a comment..." />
                <TouchableOpacity style={styles.sendBtn} onPress={() => handleAddQuestionComment(selectedQuestion?.Id)}><Text style={styles.sendBtnText}>Send</Text></TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <CheckPolicyModal visible={showPolicyModal} paperDetails={paperDetails} clos={clos} onClose={() => setShowPolicyModal(false)} onPolicyCheck={(status) => setPolicyStatus(status)} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateQuestion;

const COLORS = {
  primary50: "#f0fdf4",
  primary100: "#dcfce7",
  primary200: "#bbf7d0",
  primary300: "#86efac",
  primary400: "#4ade80",
  primary500: "#22c55e",
  primary600: "#16a34a",
  primary700: "#15803d",
  primary800: "#166534",
  primary900: "#14532d",
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
};

const styles = StyleSheet.create({
 container: { 
  flex: 1, 
  backgroundColor: COLORS.gray50,
},

paperContentContainer: { 
  flexGrow: 1, 
  paddingHorizontal: 12,   // 👈 thora kam padding
  paddingTop: 10, 
  paddingBottom: 24 
},


diffBox: {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#e5e7eb",
  borderRadius: 12,
  padding: 12,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},

addedText: {
  backgroundColor: "#dbe11b", // light yellow
  color: "#000",
  paddingHorizontal: 3,
  borderRadius: 4,
},

removedText: {
  backgroundColor: "#fee2e2", // light red
  textDecorationLine: "line-through",
  color: "#999292",
  paddingHorizontal: 3,
  borderRadius: 4,
},
  header: {
  backgroundColor: '#0B8F5A',
  padding: 16,
  flexDirection: 'row',
  justifyContent: 'center', // center items horizontally
  alignItems: 'center',
  position: 'relative',      // optional if you have absolute buttons
},
headerTitle: {
  color: 'white',
  fontSize: 30,
  fontWeight: 'bold',
  textAlign: 'center',      // ensures text itself is centered
  flex: 1,                  // takes available space
},

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12 },
  paperContainer: { flex: 1, backgroundColor: COLORS.gray50 },
//   paperContentContainer: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 36 },
//   paperHeader: {
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },
paperHeader: {
  backgroundColor: "#fff",
  borderRadius: 14,   // 👈 less radius
  padding: 14,        // 👈 compact
  marginBottom: 12,
  shadowColor: "#000",
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 2,
  borderWidth: 1,
  borderColor: COLORS.gray200,
  flexDirection: "column",   // 👈 mobile friendly
  gap: 10
},
  headerLeft: { flex: 1 },
  paperTitle: { fontSize: 24, fontWeight: "800", color: COLORS.gray900, marginBottom: 8 },
  paperMeta: { flexDirection: "row" },
  metaItem: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  metaLabel: { fontSize: 14, color: COLORS.gray500, fontWeight: "600" },
  metaValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.gray900,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: COLORS.gray100 },
  clickableStatus: { backgroundColor: "#fef3c7" },
  directorApproveBtn: { backgroundColor: "#dcfce7", borderWidth: 1, borderColor: COLORS.primary500 },
  statusText: { fontWeight: "700" },
//   paperStats: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
//   statCard: {
//     width: "48%",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 18,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//   },
// paperStats: { 
//   marginTop: 10, 
//   flexDirection: "row", 
//   flexWrap: "wrap", 
//   justifyContent: "space-between", 
// },

// statCard: {
//   width: "100%",   // 👈 FULL WIDTH (mobile friendly)
//   backgroundColor: "#fff",
//   borderRadius: 12,
//   padding: 14,
//   flexDirection: "row",
//   alignItems: "center",
//   marginBottom: 10,
//   borderWidth: 1,
//   borderColor: COLORS.gray200,
// },
paperStats: { 
  marginTop: 10, 
  flexDirection: "row", 
  flexWrap: "wrap", 
  justifyContent: "space-between",
},

statCard: {
  width: "48%",   // 🔥 2 cards in one row
  backgroundColor: "#fff",
  borderRadius: 10,
  paddingVertical: 12,
  paddingHorizontal: 10,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: COLORS.gray200,
  alignItems: "center",   // 🔥 center content
},
  statIcon: { fontSize: 24, width: 48, height: 48, textAlign: "center" },
  statInfo: {},
  statLabel: { fontSize: 12, color: COLORS.gray500 },
  statValue: { fontSize: 22, fontWeight: "800", color: COLORS.gray900 },
  headerActions: { justifyContent: "center" },
  commentBtn: { flexDirection: "row", alignItems: "center" },
  commentText: { marginLeft: 8 },
//   questionTabs: { marginTop: 12, padding: 6, borderRadius: 14, backgroundColor: COLORS.gray50, borderWidth: 1, borderColor: COLORS.gray200 },
  questionTabsContent: { alignItems: "center" },
//   tabBtn: { paddingHorizontal: 18, paddingVertical: 10, marginRight: 8, backgroundColor: "transparent", borderRadius: 10 },
//   tabText: { color: COLORS.gray600, fontWeight: "700" },
//   tabActive: { backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.primary200 },
questionTabs: { 
  marginTop: 10, 
  paddingVertical: 6,
  borderRadius: 10, 
  backgroundColor: "#fff",
  borderWidth: 1, 
  borderColor: COLORS.gray200 
},

tabBtn: { 
  paddingHorizontal: 14, 
  paddingVertical: 8, 
  marginRight: 6, 
  borderRadius: 8 
},

tabText: { 
  fontSize: 13,   // 👈 smaller text
  color: COLORS.gray600, 
  fontWeight: "600" 
},

strikeText: {
  textDecorationLine: "line-through",
  color: "#9ca3af",
},

boldText: {
  fontWeight: "700",
  color: "#16a34a",
},

normalText: {
  fontSize: 16,
  color: "#374151",
},
tabActive: { 
  backgroundColor: COLORS.primary100 
},
  extraQuestionTab: { backgroundColor: "#fff2b0" },
  totalQuestions: { alignSelf: "center", marginLeft: 8, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: COLORS.gray200 },
  questionsGrid: { marginTop: 12 },
//   questionCard: { borderRadius: 20, overflow: "hidden", backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.gray200, paddingBottom: 12},
  editingCard: { borderWidth: 2, borderColor: COLORS.primary500 },
//   questionCardHeader: { padding: 16, backgroundColor: COLORS.gray50, borderBottomWidth: 1, borderColor: COLORS.gray200, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
questionCard: { 
  borderRadius: 14, 
  backgroundColor: "#fff", 
  borderWidth: 1, 
  borderColor: COLORS.gray200, 
  marginTop: 10
},

highlightedText: {
  backgroundColor: "#fff3cd", // light yellow highlight
  padding: 6,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "#ffeeba",
},
questionCardHeader: { 
  padding: 12, 
  backgroundColor: COLORS.gray50, 
  flexDirection: "column",   // 👈 mobile fix
  gap: 8
},
  questionNumber: { fontWeight: "800", color: COLORS.primary700, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: COLORS.primary200 },
//   leftActions: { flexDirection: "row", alignItems: "center", gap: 8 },
//   editButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.gray200 },
//   // deleteButton: { backgroundColor: COLORS.error, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
//   // deleteButtonText: { color: "#fff" },
//  deleteButton: {
//   backgroundColor: 'red',   // red button
//   paddingHorizontal: 12,
//   paddingVertical: 6,
//   borderRadius: 6,
//   alignItems: 'center',
//   justifyContent: 'center',
//   marginLeft: 10,           // spacing from other buttons
//   minWidth: 70,             // ensures button isn't too narrow
//   height: 35,               // consistent height
// },
// deleteButtonText: {
//   color: '#fff',            // white text
//   fontWeight: 'bold',
//   fontSize: 14,
//   textAlign: 'center',
// },



  // leftActions: {
  //   flexDirection: "row",
  //   marginVertical: 8,
  //   paddingHorizontal: 4,
  // },
  leftActions: {
  flexDirection: "row",
  flexWrap: "wrap",   // 👈 IMPORTANT
  gap: 8,
  marginTop: 6,
},

  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#60a5fa",
    borderRadius: 6,
    marginRight: 8,
    minWidth: 80,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  reorderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#34d399",
    borderRadius: 6,
    marginRight: 8,
    minWidth: 120,
    alignItems: "center",
  },
  reorderTextBtn: {
    color: "#fff",
    fontWeight: "500",
  },
  commentBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fbbf24",
    borderRadius: 6,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  commentText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 4,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ef4444",
    borderRadius: 6,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "500",
  },

  editForm: { padding: 20, backgroundColor: "#fff" },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "700", color: COLORS.gray700, marginBottom: 8 },
//   textarea: { borderWidth: 2, borderColor: COLORS.gray200, borderRadius: 12, padding: 12, minHeight: 100, textAlignVertical: "top" },
//   input: { borderWidth: 2, borderColor: COLORS.gray200, borderRadius: 12, padding: 10, width: 120 },
input: { 
  borderWidth: 1.5, 
  borderColor: COLORS.gray300, 
  borderRadius: 10, 
  padding: 10, 
  width: "100%"   // 👈 fix width
},

textarea: { 
  borderWidth: 1.5, 
  borderColor: COLORS.gray300, 
  borderRadius: 10, 
  padding: 10, 
  minHeight: 90 
},
  formRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  difficultySelector: { flexDirection: "row", gap: 12 },
  difficultyBtn: { padding: 12, borderWidth: 2, borderColor: COLORS.gray200, borderRadius: 12 },
  difficultyActive: { borderColor: COLORS.primary500, backgroundColor: COLORS.primary100 },
  imageUpload: { borderWidth: 2, borderStyle: "dashed", borderColor: COLORS.gray300, borderRadius: 16, padding: 16, backgroundColor: COLORS.gray50 },
  imagePreview: { position: "relative", marginBottom: 12, borderRadius: 12, overflow: "hidden", width: "100%", borderWidth: 1, borderColor: COLORS.gray200 },
  previewImg: { width: "100%", height: Math.round(SCREEN_WIDTH * 0.45), resizeMode: "cover" },
  removeImageBtn: { position: "absolute", top: 8, right: 8, backgroundColor: "#fff", borderRadius: 16, padding: 6 },
  removeImageText: { fontSize: 16 },
  uploadArea: { flexDirection: "row", alignItems: "center", gap: 12 },
  uploadLabel: { backgroundColor: COLORS.primary600, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  uploadLabelText: { color: "#fff", fontWeight: "700" },
  uploadHint: { color: COLORS.gray500 },
  editActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 12 },
//   cancelBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: "#fff", borderWidth: 2, borderColor: COLORS.gray300 },
//   saveBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.primary600 },
  saveBtn: { 
  paddingVertical: 12, 
  borderRadius: 10, 
  backgroundColor: COLORS.primary600,
  alignItems: "center"
},

cancelBtn: { 
  paddingVertical: 12, 
  borderRadius: 10, 
  borderWidth: 1, 
  borderColor: COLORS.gray300,
  alignItems: "center"
},
saveText: { color: "#fff", fontWeight: "700" },
  questionContent: { padding: 20 },
  questionText: { fontSize: 16, lineHeight: 22, color: COLORS.gray800, marginBottom: 12 },
  questionImageContainer: { marginVertical: 12, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.gray50 },
//   questionImage: { width: "100%", height: Math.round(SCREEN_WIDTH * 0.45), resizeMode: "cover" },
questionImage: { 
  width: "100%", 
  height: 180,   // 👈 fixed height (better than dynamic)
  resizeMode: "cover" 
},
  questionTags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: COLORS.gray100 },
  marksTag: { backgroundColor: COLORS.primary50 },
  cloTag: { backgroundColor: COLORS.gray100 },
  difficultyEasy: { backgroundColor: COLORS.primary50 },
  difficultyMedium: { backgroundColor: "#fffbeb" },
  difficultyTough: { backgroundColor: "#fef2f2" },
  approvalActions: { flexDirection: "row", gap: 8 },
  approveBtn: { padding: 8, backgroundColor: "#d4edda", borderRadius: 8 },
  rejectBtn: { padding: 8, backgroundColor: "#f8d7da", borderRadius: 8 },
  notification: { position: "absolute", top: 24, right: 24, padding: 12, borderRadius: 12, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.12, elevation: 4, flexDirection: "row", alignItems: "center", zIndex: 1000 },
  notificationContent: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  notificationIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.success, color: "#fff", textAlign: "center" },
  notificationText: { flex: 1 },
  notificationClose: { marginLeft: 8, fontSize: 18 },
  successNotif: { borderLeftWidth: 4, borderLeftColor: COLORS.success },
  errorNotif: { borderLeftWidth: 4, borderLeftColor: COLORS.error },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "92%", maxHeight: "80%", backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: COLORS.primary600 },
  modalTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
  modalClose: { color: "#fff", fontWeight: "700", fontSize: 20 },
  modalBody: { padding: 12 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", padding: 12 },
  modalBtn: { padding: 10, borderRadius: 8, backgroundColor: "#f3f4f6" },
  primaryBtn: { backgroundColor: COLORS.primary600 },
  primaryBtnText: { color: "#fff" },
  commentsOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
//   commentsModal: { width: "92%", maxHeight: "80%", backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", alignSelf: "center" },
commentsModal: { 
  width: "95%", 
  maxHeight: "85%", 
  borderRadius: 16 
},

commentInput: { 
  flex: 1, 
  minHeight: 40, 
  borderRadius: 20,
  paddingHorizontal: 12
},
  commentsHeader: { padding: 16, backgroundColor: COLORS.primary700, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commentsTitle: { color: "#fff", fontWeight: "800" },
  commentsBody: { padding: 12, backgroundColor: COLORS.primary50, maxHeight: 420 },
  commentItem: { maxWidth: "85%", padding: 12, borderRadius: 18, marginBottom: 10 },
  sent: { backgroundColor: "#bbf7d0", alignSelf: "flex-end" },
  received: { backgroundColor: "#e6f4ea", alignSelf: "flex-start" },
  commentUser: { fontWeight: "700", fontSize: 13, marginBottom: 4, color: COLORS.primary700 },
  commentText: { fontSize: 14, color: COLORS.gray800 },
  commentDate: { fontSize: 11, color: COLORS.gray500, marginTop: 6, textAlign: 'right' },
  commentsFooter: { padding: 16, backgroundColor: "#fff", flexDirection: "row", gap: 10, alignItems: "center", borderTopWidth: 1, borderColor: COLORS.gray200 },
//   commentInput: { flex: 1, minHeight: 45, borderWidth: 1, borderColor: COLORS.gray300, borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: COLORS.gray50 },
  sendBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.primary700, borderRadius: 25 },
  sendBtnText: { color: "#fff", fontWeight: "700" },
  noComments: { color: COLORS.gray500, textAlign: "center", marginTop: 20 },
  
  // Custom Styles for CLO Modal
  cloModalContainer: { width: "85%", backgroundColor: "#fff", borderRadius: 20, padding: 20, maxHeight: "70%" },
  cloListItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  closeBtn: { marginTop: 15, backgroundColor: COLORS.primary600, padding: 12, borderRadius: 10, alignItems: 'center' },
});
