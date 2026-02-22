import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../../../config/Api';

const ViewCLOs = ({ navigation, route }) => {
  const { courseId, courseCode } = route.params || {};

  const [clos, setClos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [text, setText] = useState('');

  /* ================= FETCH ================= */
  const fetchCLOs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/clos/get_Clos/${courseId}`);
      const json = await res.json();

      const formatted = Array.isArray(json)
        ? json.map(c => ({ id: c.id, description: c.description }))
        : [];

      setClos(formatted);
    } catch {
      Alert.alert('Error', 'Failed to load CLOs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchCLOs();
    else setLoading(false);
  }, [courseId]);

  /* ================= ADD ================= */
  const addCLO = async () => {
    if (!text.trim()) return;

    await fetch(`${BASE_URL}/clos/add_clos/${courseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: text }),
    });

    setText('');
    setAdding(false);
    fetchCLOs();
  };

  /* ================= UPDATE ================= */
  const updateCLO = async (id) => {
    if (!text.trim()) return;

    await fetch(`${BASE_URL}/clos/update/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: text }),
    });

    setEditingId(null);
    setText('');
    fetchCLOs();
  };

  /* ================= DELETE ================= */
  const deleteCLO = (id) => {
    Alert.alert('Delete CLO', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          await fetch(`${BASE_URL}/clos/delete/${id}`, { method: 'POST' });
          fetchCLOs();
        },
      },
    ]);
  };

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item, index }) => {
    const editing = editingId === item.id;

    return (
      <View style={styles.cloCard}>
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              style={styles.input}
              autoFocus
            />
            <TouchableOpacity onPress={() => updateCLO(item.id)} style={styles.ok}>
              <Ionicons name="checkmark" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEditingId(null);
                setText('');
              }}
              style={styles.cancel}
            >
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.cloText}>
              CLO {index + 1}: {item.description}
            </Text>

            <View style={styles.iconRow}>
              <TouchableOpacity
                style={styles.iconEdit}
                onPress={() => {
                  setEditingId(item.id);
                  setText(item.description);
                }}
              >
                <Ionicons name="pencil" size={18} color="#0B8F5A" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconDelete}
                onPress={() => deleteCLO(item.id)}
              >
                <Ionicons name="trash" size={18} color="#FF4D4D" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  /* ================= DISMISS KEYBOARD ================= */
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setAdding(false);
    setEditingId(null);
    setText('');
  };

  /* ================= HEADER INPUT ================= */
  const renderHeader = () =>
    adding ? (
      <View style={styles.addCard}>
        <View style={styles.editRow}>
          <TextInput
            placeholder="Enter CLO description"
            value={text}
            onChangeText={setText}
            style={styles.input}
            autoFocus
          />
          <TouchableOpacity onPress={addCLO} style={styles.ok}>
            <Ionicons name="checkmark" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setAdding(false);
              setText('');
            }}
            style={styles.cancel}
          >
            <Ionicons name="close" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    ) : null;

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
              <Text style={styles.headerTitle}>CLO - {courseCode}</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={26} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* ADD BUTTON */}
            {!adding && editingId === null && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setAdding(true)}
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
                data={clos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                  !adding && (
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
                        No CLOs added for this course
                      </Text>
                    </View>
                  )
                }
                contentContainerStyle={{ paddingBottom: 30 }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ViewCLOs;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

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

  addBtn: {
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

  cloCard: {
    backgroundColor: '#F0FFF7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#B7E4D2',
  },

  cloText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#064E3B',
    marginBottom: 12,
  },

  iconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },

  iconEdit: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconDelete: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  editRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },

  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },

  ok: {
    backgroundColor: '#0B8F5A',
    borderRadius: 12,
    padding: 10,
  },

  cancel: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
  },

  addCard: {
    padding: 16,
  },
});
