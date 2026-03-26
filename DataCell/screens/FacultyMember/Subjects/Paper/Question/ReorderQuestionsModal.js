import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  SafeAreaView
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const ReorderQuestionsModal = ({ visible, questions, onClose, onSave }) => {
  const [localQuestions, setLocalQuestions] = useState([...questions]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = (newQuestions) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...localQuestions]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setLocalQuestions(newQuestions);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newQuestions = [...localQuestions];
    [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
    saveToHistory(newQuestions);
  };

  const moveDown = (index) => {
    if (index === localQuestions.length - 1) return;
    const newQuestions = [...localQuestions];
    [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    saveToHistory(newQuestions);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLocalQuestions(history[historyIndex - 1]);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setLocalQuestions(questions);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLocalQuestions(history[historyIndex + 1]);
    }
  };

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return { bg: "#e6f7e6", color: "#2e7d32", border: "#a5d6a7" };
      case "medium": return { bg: "#fff3e0", color: "#b85e00", border: "#ffb74d" };
      case "hard":
      case "tough": return { bg: "#ffebee", color: "#c62828", border: "#ef9a9a" };
      default: return { bg: "#f5f5f5", color: "#616161", border: "#e0e0e0" };
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Reorder Items</Text>
              <Text style={styles.badgeText}>{localQuestions.length} Total Questions</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleUndo} disabled={!canUndo} style={[styles.historyBtn, !canUndo && styles.disabled]}>
                <Text style={styles.historyIcon}>↩</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleRedo} disabled={!canRedo} style={[styles.historyBtn, !canRedo && styles.disabled]}>
                <Text style={styles.historyIcon}>↪</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {localQuestions.map((q, index) => {
              const diffStyle = getDifficultyColor(q.Difficulty || q.DifficultyLevel);
              return (
                <View key={q.Id} style={styles.itemCard}>
                  {/* Drag Handle Style Sign */}
                  <View style={styles.dragHandle}>
                    <Text style={styles.dragIcon}>⠿</Text>
                  </View>

                  <View style={styles.itemContent}>
                    <Text style={styles.itemLabel}>Question {index + 1}</Text>
                    <Text style={styles.itemText} numberOfLines={1}>{q.Text}</Text>
                    
                    <View style={styles.tagRow}>
                       <View style={[styles.tag, { backgroundColor: diffStyle.bg, borderColor: diffStyle.border }]}>
                          <Text style={[styles.tagText, { color: diffStyle.color }]}>{q.Difficulty || q.DifficultyLevel}</Text>
                       </View>
                       <View style={styles.tag}><Text style={styles.tagText}>{q.Marks} Marks</Text></View>
                    </View>
                  </View>

                  {/* Move Controls - Clean Triangles */}
                  <View style={styles.controls}>
                    <TouchableOpacity 
                      style={[styles.moveBtn, index === 0 && styles.disabled]} 
                      onPress={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      <Text style={styles.arrowIcon}>▲</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.moveBtn, index === localQuestions.length - 1 && styles.disabled]} 
                      onPress={() => moveDown(index)}
                      disabled={index === localQuestions.length - 1}
                    >
                      <Text style={styles.arrowIcon}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(localQuestions)}>
              <Text style={styles.saveBtnText}>Save New Order</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContainer: { height: SCREEN_HEIGHT * 0.8, backgroundColor: "#fff", borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 18, fontWeight: "bold", color: "#333" },
  badgeText: { fontSize: 12, color: "#888", marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  historyBtn: { width: 35, height: 35, borderRadius: 8, backgroundColor: "#f5f5f5", justifyContent: "center", alignItems: "center" },
  historyIcon: { fontSize: 18, color: "#444" },
  closeBtn: { marginLeft: 5 },
  closeIcon: { fontSize: 20, color: "#999", fontWeight: "bold" },
  list: { padding: 15 },
  itemCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#f0f0f0", elevation: 2 },
  dragHandle: { marginRight: 10 },
  dragIcon: { fontSize: 18, color: "#ccc" },
  itemContent: { flex: 1 },
  itemLabel: { fontSize: 10, fontWeight: "bold", color: "#0a8f4e", marginBottom: 2 },
  itemText: { fontSize: 14, color: "#444" },
  tagRow: { flexDirection: "row", marginTop: 6, gap: 5 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, borderWidth: 1, borderColor: "#eee" },
  tagText: { fontSize: 10 },
  controls: { flexDirection: "column", gap: 6, marginLeft: 10 },
  moveBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#f0fdf4", justifyContent: "center", alignItems: "center" },
  arrowIcon: { fontSize: 12, color: "#0a8f4e", fontWeight: "bold" },
  disabled: { opacity: 0.2 },
  footer: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", padding: 20, borderTopWidth: 1, borderTopColor: "#eee" },
  cancelLink: { marginRight: 20 },
  cancelText: { color: "#888", fontWeight: "600" },
  saveBtn: { backgroundColor: "#0a8f4e", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
});

export default ReorderQuestionsModal;