import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { BASE_URL } from '../../../config/Api';

const ViewCourses = ({ navigation }) => {
  // ====== HOOKS (SIRF YAHAN) ======
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // ====== FETCH COURSES ======
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        (`${BASE_URL}/course/get_all_courses?page=1&pageSize=1000`)
      //   'http://192.168.137.1//fypProject/api/course/get_all_courses?page=1&pageSize=50'
       );
      setCourses(res.data.data || []);
    } catch (e) { 
      console.log('API error:', e);
    } finally {
      setLoading(false);
    }
  };

  // ====== SEARCH FILTER (NO HOOK HERE) ======
  const filteredCourses = courses.filter(item =>
    item.course_code?.toLowerCase().includes(search.toLowerCase()) ||
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    String(item.credit_hours).includes(search)
  );

  // ====== RENDER ITEM (NO HOOK) ======
  const renderItem6 = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.code}>{item.course_code}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.teacher}>
        Credit Hours: {item.credit_hours}
      </Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate('Topics', {
              courseId: item.id,
              courseCode: item.course_code,
            })
          }
        >
          <Ionicons name="list-outline" size={16} color="#fff" />
          <Text style={styles.btnText}> View Topics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate('CLO', {
              courseId: item.id,
              courseCode: item.course_code,
            })
          }
        >
          <Ionicons name="school-outline" size={16} color="#fff" />
          <Text style={styles.btnText}> View CLO</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.assessmentBtn}
        onPress={() =>
          navigation.navigate('AssessmentPolicy', {
            courseId: item.id,
            courseCode: item.course_code,
          })
        }
      >
        <Ionicons name="settings-outline" size={18} color="#fff" />
        <Text style={styles.assessmentText}> Assessment Policy</Text>
      </TouchableOpacity>
    </View>
  );

  // ====== UI ======
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0B8F5A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Detail</Text>
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.sectionTitle}>All Courses</Text>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          placeholder="Search by course, title or credit hr..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredCourses}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem6}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default ViewCourses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 16,
  },

  header: {
    backgroundColor: '#0B8F5A',
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },

  sectionTitle: {
    color: '#0B8F5A',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 45,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },

  code: {
    color: '#0B8F5A',
    fontWeight: '700',
    marginBottom: 4,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  teacher: {
    color: '#666',
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  btn: {
    backgroundColor: '#0B8F5A',
    paddingVertical: 12,
    borderRadius: 10,
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  assessmentBtn: {
    backgroundColor: '#0FAF8F',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  assessmentText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
