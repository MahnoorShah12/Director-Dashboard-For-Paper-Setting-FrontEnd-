import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import {
  MaterialIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";

const ReorderQuestionsModal = ({
  visible,
  questions,
  onClose,
  onSave,
}) => {
  const [localQuestions, setLocalQuestions] = useState([
    ...questions,
  ]);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = (newQuestions) => {
    const newHistory = history.slice(
      0,
      historyIndex + 1
    );

    newHistory.push([...localQuestions]);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setLocalQuestions(newQuestions);
  };

  const moveUp = (index) => {
    if (index === 0) return;

    const newQuestions = [...localQuestions];

    [newQuestions[index - 1], newQuestions[index]] = [
      newQuestions[index],
      newQuestions[index - 1],
    ];

    saveToHistory(newQuestions);
  };

  const moveDown = (index) => {
    if (index === localQuestions.length - 1) return;

    const newQuestions = [...localQuestions];

    [newQuestions[index], newQuestions[index + 1]] = [
      newQuestions[index + 1],
      newQuestions[index],
    ];

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

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return {
          bg: "#e6f7e6",
          color: "#2e7d32",
          border: "#a5d6a7",
        };

      case "medium":
        return {
          bg: "#fff3e0",
          color: "#b85e00",
          border: "#ffb74d",
        };

      case "hard":
        return {
          bg: "#ffebee",
          color: "#c62828",
          border: "#ef9a9a",
        };

      default:
        return {
          bg: "#f5f5f5",
          color: "#616161",
          border: "#e0e0e0",
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>

          {/* Header */}
          <View style={styles.header}>

            <View style={styles.headerLeft}>
              <Text style={styles.title}>
                Reorder Questions
              </Text>

              <View style={styles.badge}>
                <FontAwesome5
                  name="tag"
                  size={10}
                  color="#777"
                />

                <Text style={styles.badgeText}>
                  {localQuestions.length} items
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>

              <TouchableOpacity
                style={[
                  styles.historyBtn,
                  !canUndo && styles.disabledBtn,
                ]}
                onPress={handleUndo}
                disabled={!canUndo}
              >
                <MaterialIcons
                  name="undo"
                  size={18}
                  color="#555"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.historyBtn,
                  !canRedo && styles.disabledBtn,
                ]}
                onPress={handleRedo}
                disabled={!canRedo}
              >
                <MaterialIcons
                  name="redo"
                  size={18}
                  color="#555"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >

            <View style={styles.contentHeader}>

              <View style={styles.subtitleRow}>
                <Feather
                  name="clock"
                  size={13}
                  color="#888"
                />

                <Text style={styles.subtitle}>
                  Drag items or use arrow buttons
                </Text>
              </View>

              {historyIndex >= 0 && (
                <View style={styles.historyIndicator}>
                  <Text style={styles.historyIndicatorText}>
                    {historyIndex + 1} of{" "}
                    {history.length} changes
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.list}>

              {localQuestions.map((q, index) => {
                const difficultyStyle =
                  getDifficultyStyle(q.Difficulty);

                return (
                  <View
                    key={q.Id}
                    style={styles.listItem}
                  >

                    {/* Drag */}
                    <View style={styles.drag}>
                      <MaterialIcons
                        name="drag-indicator"
                        size={18}
                        color="#ccc"
                      />
                    </View>

                    {/* Number */}
                    <View style={styles.numberBox}>
                      <Text style={styles.numberText}>
                        {index + 1}
                      </Text>
                    </View>

                    {/* Content */}
                    <View style={styles.itemContent}>

                      <Text style={styles.questionText}>
                        {q.Text}
                      </Text>

                      <View style={styles.tagsRow}>

                        {q.Difficulty && (
                          <View
                            style={[
                              styles.tag,
                              {
                                backgroundColor:
                                  difficultyStyle.bg,
                                borderColor:
                                  difficultyStyle.border,
                              },
                            ]}
                          >
                            <Text
                              style={{
                                color:
                                  difficultyStyle.color,
                                fontSize: 11,
                                fontWeight: "600",
                              }}
                            >
                              {q.Difficulty}
                            </Text>
                          </View>
                        )}

                        {q.CLO && (
                          <View
                            style={[
                              styles.tag,
                              styles.cloTag,
                            ]}
                          >
                            <Text
                              style={styles.cloText}
                            >
                              {q.CLO}
                            </Text>
                          </View>
                        )}

                        {q.Marks && (
                          <View
                            style={[
                              styles.tag,
                              styles.marksTag,
                            ]}
                          >
                            <Text
                              style={styles.marksText}
                            >
                              {q.Marks} marks
                            </Text>
                          </View>
                        )}

                      </View>
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>

                      <TouchableOpacity
                        style={[
                          styles.controlBtn,
                          index === 0 &&
                            styles.disabledBtn,
                        ]}
                        disabled={index === 0}
                        onPress={() => moveUp(index)}
                      >
                        <Text style={styles.controlText}>
                          ↑
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.controlBtn,
                          index ===
                            localQuestions.length - 1 &&
                            styles.disabledBtn,
                        ]}
                        disabled={
                          index ===
                          localQuestions.length - 1
                        }
                        onPress={() => moveDown(index)}
                      >
                        <Text style={styles.controlText}>
                          ↓
                        </Text>
                      </TouchableOpacity>

                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
            >
              <Text style={styles.cancelBtnText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => onSave(localQuestions)}
            >
              <Text style={styles.saveBtnText}>
                Save Order
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </View>
    </Modal>
  );
};

export default ReorderQuestionsModal;

/* ================== STYLES ================== */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modal: {
    width: "100%",
    maxWidth: 700,
    maxHeight: "95%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 15,
  },

  /* Header */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginRight: 10,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  historyBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#fff",
  },

  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  closeText: {
    fontSize: 18,
    color: "#777",
  },

  disabledBtn: {
    opacity: 0.4,
  },

  /* Content */

  content: {
    padding: 20,
  },

  contentHeader: {
    marginBottom: 16,
  },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  subtitle: {
    marginLeft: 6,
    fontSize: 13,
    color: "#666",
  },

  historyIndicator: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  historyIndicatorText: {
    fontSize: 11,
    color: "#666",
  },

  list: {
    gap: 10,
  },

  /* Item */

  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#eaeaea",
    borderRadius: 10,
    padding: 14,
  },

  drag: {
    paddingTop: 3,
    marginRight: 10,
  },

  numberBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  numberText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },

  itemContent: {
    flex: 1,
  },

  questionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
    marginBottom: 8,
  },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },

  cloTag: {
    backgroundColor: "#e3f2fd",
    borderColor: "#bbdefb",
  },

  cloText: {
    color: "#0d47a1",
    fontSize: 11,
    fontWeight: "600",
  },

  marksTag: {
    backgroundColor: "#f3e5f5",
    borderColor: "#e1bee7",
  },

  marksText: {
    color: "#6a1b9a",
    fontSize: 11,
    fontWeight: "600",
  },

  controls: {
    marginLeft: 10,
  },

  controlBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    backgroundColor: "#fff",
  },

  controlText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
  },

  /* Footer */

  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    backgroundColor: "#fafafa",
  },

  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginRight: 10,
  },

  cancelBtnText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },

  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#15803d",
  },

  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});