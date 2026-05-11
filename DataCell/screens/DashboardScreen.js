import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../config/Api';

const DashboardScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [roles, setRoles] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const logout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('user_name');
        const storedRoles = await AsyncStorage.getItem('user_roles');
        const storedID = await AsyncStorage.getItem('user_id');

        if (!storedRoles) {
          navigation.replace('Login');
          return;
        }

        setName(storedName || '');
        const parsedRoles = JSON.parse(storedRoles).map(r => r.toLowerCase());
        setRoles(parsedRoles);

        if (parsedRoles.includes('faculty') && storedID) {
          const response = await fetch(
            `http://192.168.31.125/fypProject/api/paper/Get_Teacher_Courses/${storedID}`
          );
          const data = await response.json();
          setTeacherCourses(data.Courses || []);
        }
      } catch (error) {
        console.log('Dashboard Error:', error);
      }
    };
    loadData();
  }, []);

  const PanelButton = ({ title, icon, onPress }) => (
    <TouchableOpacity style={styles.panelButton} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.panelButtonIcon}>
        <Ionicons name={icon || 'chevron-forward-outline'} size={18} color="#0B8F5A" />
      </View>
      <Text style={styles.panelButtonText}>{title}</Text>
      <Ionicons name="chevron-forward" size={16} color="#C0C0C0" />
    </TouchableOpacity>
  );

  const SectionCard = ({ title, icon, children }) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>
          <Ionicons name={icon} size={18} color="#fff" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <StatusBar backgroundColor="#065c39" barStyle="light-content" />

      <View style={styles.topBar}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {/* <Text style={styles.topBarGreeting}>Good day,</Text> */}
          <Text style={styles.topBarName} numberOfLines={1}>{name || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Role Chips */}
        <View style={styles.chipRow}>
          {roles.map(r => (
            <View key={r} style={styles.chip}>
              <Text style={styles.chipText}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
            </View>
          ))}
        </View>

        {/* DataCell */}
        {roles.includes('datacell') && (
          <SectionCard title="DataCell Panel" icon="server-outline">
            <PanelButton title="Manage Faculty" icon="people-outline" onPress={() => navigation.navigate('Faculty')} />
            <PanelButton title="Add Course" icon="add-circle-outline" onPress={() => navigation.navigate('AddCourse')} />
            <PanelButton title="Assign Course" icon="git-branch-outline" onPress={() => navigation.navigate('AssignCourse')} />
            <PanelButton title="Paper Verification" icon="shield-checkmark-outline" onPress={() => navigation.navigate('PaperVerification')} />
          </SectionCard>
        )}

        {/* HOD */}
        {roles.includes('hod') && (
          <SectionCard title="HOD Panel" icon="business-outline">
            <PanelButton title="View Faculty" icon="people-circle-outline" onPress={() => navigation.navigate('ViewFaculty')} />
            <PanelButton title="View Course" icon="book-outline" onPress={() => navigation.navigate('ViewCourse')} />
            <PanelButton title="Assign Paper" icon="document-attach-outline" onPress={() => navigation.navigate('AssignPaper')} />
            <PanelButton title="Assign Course" icon="git-branch-outline" onPress={() => navigation.navigate('AssignCourse')} />
          </SectionCard>
        )}

        {/* Director */}
        {roles.includes('director') && (
          <SectionCard title="Director Panel" icon="briefcase-outline">
            <PanelButton title="Current Papers" icon="newspaper-outline" onPress={() => navigation.navigate('CurrentPapers')} />
            <PanelButton title="Past Papers" icon="archive-outline" onPress={() => navigation.navigate('PastPaper')} />
            <PanelButton title="Paper Submission Plan" icon="calendar-outline" onPress={() => navigation.navigate('VettingAlerts')} />
            <PanelButton title="Role Handover" icon="swap-horizontal-outline" onPress={() => navigation.navigate('DutySwitch')} />
            <PanelButton title="Meeting Schedule" icon="time-outline" onPress={() => navigation.navigate('MeetingScheduleByTimeTable')} />
          </SectionCard>
        )}

        {/* Faculty */}
        {roles.includes('faculty') && (
          <SectionCard title="My Courses" icon="school-outline">
            {teacherCourses.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={36} color="#ccc" />
                <Text style={styles.emptyText}>No courses assigned yet</Text>
              </View>
            ) : (
              teacherCourses.map((course) => (
                <View key={course.CourseId} style={{ position: 'relative' }}>
                  {course.ViewOnly && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>CREATE</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.courseCard}
                    onPress={() => navigation.navigate('MySubjects', { courseId: course.CourseId })}
                    activeOpacity={0.75}
                  >
                    <View style={styles.courseIconWrap}>
                      <Ionicons name="book-outline" size={20} color="#0B8F5A" />
                    </View>
                    <Text style={styles.courseTitle}>{course.CourseTitle}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#C0C0C0" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </SectionCard>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </>
  );
};

export default DashboardScreen;

const BRAND = '#0B8F5A';
const BRAND_DARK = '#065c39';
const BRAND_LIGHT = '#e8f7f1';

const styles = StyleSheet.create({
  /* ── Top Bar ── */
  topBar: {
    backgroundColor: BRAND_DARK,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    color: BRAND,
    fontWeight: '800',
    fontSize: 16,
  },
  topBarGreeting: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  topBarName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ── Scroll ── */
  scroll: {
    backgroundColor: '#F0F4F2',
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingTop: 20,
  },

  /* ── Role Chips ── */
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: BRAND_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#b2dece',
  },
  chipText: {
    color: BRAND,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* ── Section Card ── */
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#0B8F5A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BRAND,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  sectionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionBody: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  /* ── Panel Button ── */
  panelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  panelButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BRAND_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    letterSpacing: 0.1,
  },

  /* ── Course Card ── */
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  courseIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BRAND_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },

  /* ── Empty State ── */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },

  /* ── Badge ── */
  badge: {
    position: 'absolute',
    top: 8,
    right: 28,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});