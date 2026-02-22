import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../../config/Api';

// const BASE_URL = 'http://192.168.137.1/fypProject/api/topic';

const ViewTopics = ({ navigation, route }) => {
  const { courseId, courseCode } = route.params || {};

  /* ================= STATE ================= */
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  /* ================= FETCH ================= */
  const fetchTopics = async () => {
    try {
      const res = await fetch(`${BASE_URL}/topic/byCourseGet/${courseId}`);
      const json = await res.json();

      const formatted = Array.isArray(json)
        ? json.map(t => ({
            id: t.id,
            text: t.description,
          }))
        : [];

      setTopics(formatted);
    } catch {
      Alert.alert('Error', 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchTopics();
    else setLoading(false);
  }, [courseId]);

  /* ================= ADD ================= */
  const addTopic = async () => {
    if (!editText.trim()) return;

    await fetch(`${BASE_URL}/topic/addTopic/${courseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: editText }),
    });

    setIsAdding(false);
    setEditText('');
    fetchTopics();
  };

  /* ================= UPDATE ================= */
  const saveEdit = async (id) => {
    if (!editText.trim()) return;

    // Fixed integration: backend expects POST /editTopic/{topicId}
    await fetch(`${BASE_URL}/topic/editTopic/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: editText }),
    });

    setEditingId(null);
    setEditText('');
    fetchTopics();
  };

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    Alert.alert('Delete Topic', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          // Fixed integration: backend expects POST /deleteTopic/{topicId}
          await fetch(`${BASE_URL}/topic/deleteTopic/${id}`, {
            method: 'POST',
          });
          fetchTopics();
        },
      },
    ]);
  };

  /* ================= KEYBOARD ================= */
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setEditingId(null);
    setIsAdding(false);
    setEditText('');
  };

  /* ================= HEADER INPUT ================= */
  const renderHeader = () =>
    isAdding ? (
      <View style={styles.card}>
        <View style={styles.editRow}>
          <TextInput
            placeholder="Enter Topic"
            value={editText}
            onChangeText={setEditText}
            style={styles.input}
            autoFocus
          />
          <TouchableOpacity style={styles.checkBtn} onPress={addTopic}>
            <Text style={styles.btnLabel}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setIsAdding(false);
              setEditText('');
            }}
          >
            <Text style={styles.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : null;

  /* ================= ITEM ================= */
  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      {editingId === item.id ? (
        <View style={styles.editRow}>
          <TextInput
            value={editText}
            onChangeText={setEditText}
            style={styles.input}
            autoFocus
          />
          <TouchableOpacity
            style={styles.checkBtn}
            onPress={() => saveEdit(item.id)}
          >
            <Text style={styles.btnLabel}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setEditingId(null);
              setEditText('');
            }}
          >
            <Text style={styles.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.cloText}>
            {index + 1}. {item.text}
          </Text>
          <View style={styles.iconRow}>
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => {
                setEditingId(item.id);
                setEditText(item.text);
              }}
            >
              <Ionicons name="pencil" size={18} color="#0B8F5A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash" size={18} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  /* ================= MAIN ================= */
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={{ flex: 1 }}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Topics - {courseCode}</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={26} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* ADD BUTTON */}
            {!isAdding && editingId === null && (
              <TouchableOpacity
                style={styles.addCircle}
                onPress={() => setIsAdding(true)}
              >
                <Ionicons name="add" size={26} color="#fff" />
              </TouchableOpacity>
            )}

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#0B8F5A"
                style={{ marginTop: 40 }}
              />
            ) : (
              <FlatList
                data={topics}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                  !isAdding && (
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                      <Ionicons
                        name="information-circle-outline"
                        size={42}
                        color="#9CA3AF"
                      />
                      <Text
                        style={{
                          marginTop: 12,
                          fontSize: 15,
                          fontWeight: '600',
                          color: '#6B7280',
                        }}
                      >
                        No topics added for this course
                      </Text>
                    </View>
                  )
                }
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 30 }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ViewTopics;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },

  header: {
    backgroundColor: '#0B8F5A',
    padding: 18,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },

  addCircle: {
    width: 52,
    height: 52,
    position: 'absolute',
    right: 16,
    top: 80,
    borderRadius: 26,
    backgroundColor: '#0FAF8F',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },

  card: {
    backgroundColor: '#EFFFF7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    marginHorizontal: 16,
  },

  cloText: { fontSize: 15, fontWeight: '600', marginBottom: 10 },

  iconRow: { flexDirection: 'row', justifyContent: 'flex-end' },

  editIcon: {
    borderWidth: 1,
    borderColor: '#0B8F5A',
    borderRadius: 8,
    padding: 6,
    marginRight: 10,
  },

  deleteIcon: {
    borderWidth: 1,
    borderColor: '#E74C3C',
    borderRadius: 8,
    padding: 6,
  },

  editRow: { flexDirection: 'row', alignItems: 'center' },

  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#0B8F5A',
  },

  checkBtn: {
    backgroundColor: '#0B8F5A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },

  cancelBtn: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 6,
  },

  btnLabel: { color: '#fff', fontWeight: '600' },
  cancelLabel: { color: '#333', fontWeight: '600' },
});
