import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { BASE_URL } from '../../../config/Api';

// const BASE_URL = 'http://192.168.137.1/fypProject/api';

const AssessmentPolicy = ({ navigation, route }) => {
  const courseId = route?.params?.courseId || 1;
  const courseCode = route?.params?.courseCode || 'CSC-402';

  /* ================= CLO WEIGHTAGES ================= */
  const [clos, setClos] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/clos/get_ClosWithWeightage/${courseId}`)
      .then(res => setClos(res.data || []))
      .catch(e => console.log(e));
  }, [courseId]);

  const updateCloWeight = async (cloId, term, value) => {
    try {
      await axios.post(`${BASE_URL}/clos/UpdateAndAddCloWeightage`, {
        CloId: cloId,
        Term: term,
        Weightage: Number(value) || 0,
      });
    } catch {
      Alert.alert('Error', 'Failed to save CLO weightage');
    }
  };

  const midCloTotal = clos.reduce((s, c) => s + (c.MidTermWeight || 0), 0);
  const finalCloTotal = clos.reduce((s, c) => s + (c.FinalTermWeight || 0), 0);

  /* ================= POLICY ================= */
  const [mid, setMid] = useState({ easy: 0, medium: 0, tough: 0 });
  const [finalTerm, setFinalTerm] = useState({ easy: 0, medium: 0, tough: 0 });

  useEffect(() => {
    axios
      .get(`${BASE_URL}/policy/get-difficulty-policy/${courseId}`)
      .then(res => {
        res.data?.Data?.forEach(item => {
          if (item.term?.toLowerCase() === 'mid') {
            setMid({
              easy: +item.eassy_Q || 0,
              medium: +item.medium_Q || 0,
              tough: +item.difficult_Q || 0,
            });
          }
          if (item.term?.toLowerCase() === 'final') {
            setFinalTerm({
              easy: +item.eassy_Q || 0,
              medium: +item.medium_Q || 0,
              tough: +item.difficult_Q || 0,
            });
          }
        });
      });
  }, [courseId]);

  const midTotal = mid.easy + mid.medium + mid.tough;
  const finalTotal = finalTerm.easy + finalTerm.medium + finalTerm.tough;

  const isMidValid = midTotal === 100;
  const isFinalValid = finalTotal === 100;

  const savePolicy = async () => {
    if (!isMidValid || !isFinalValid) {
      Alert.alert('Invalid', 'Mid & Final must be 100%');
      return;
    }

    await axios.post(
      `${BASE_URL}/policy/save-difficulty-policy/${courseId}`,
      [
        { Term: 'Mid', Easy: mid.easy, Medium: mid.medium, Tough: mid.tough },
        {
          Term: 'Final',
          Easy: finalTerm.easy,
          Medium: finalTerm.medium,
          Tough: finalTerm.tough,
        },
      ]
    );

    Alert.alert('Success', 'Assessment policy saved');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0FAF8F" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Assessment Policy</Text>
          <Text style={styles.subTitle}>
            Analysis of Algorithms {courseCode}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* ================= CLO WEIGHTAGES ================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CLO Weightages</Text>
            <Text style={styles.total}>
              Mid {midCloTotal}% / Final {finalCloTotal}%
            </Text>
          </View>

          {clos.map((clo, i) => (
            <View key={clo.Id} style={styles.cloCard}>
              <View style={styles.cloBadge}>
                <Text style={styles.cloBadgeText}>CLO {i + 1}</Text>
              </View>

              <Text style={styles.cloDesc}>{clo.Description}</Text>

              <View style={styles.cloRow}>
                <CloInput
                  label="Mid Term Weight"
                  value={clo.MidTermWeight}
                  onChange={v => {
                    const copy = [...clos];
                    copy[i].MidTermWeight = v;
                    setClos(copy);
                    updateCloWeight(clo.Id, 'mid', v);
                  }}
                />
                <CloInput
                  label="Final Term Weight"
                  value={clo.FinalTermWeight}
                  onChange={v => {
                    const copy = [...clos];
                    copy[i].FinalTermWeight = v;
                    setClos(copy);
                    updateCloWeight(clo.Id, 'final', v);
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ================= MID TERM ================= */}
        <PolicyBlock
          title="Mid Term Exam"
          data={mid}
          setData={setMid}
          total={midTotal}
          valid={isMidValid}
        />

        {/* ================= FINAL TERM ================= */}
        <PolicyBlock
          title="Final Term Exam"
          data={finalTerm}
          setData={setFinalTerm}
          total={finalTotal}
          valid={isFinalValid}
        />

        {/* ================= POLICY SUMMARY ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Policy Summary</Text>
          <View style={styles.summaryContainer}>
            <SummaryCard title="Mid Term" data={mid} />
            <SummaryCard title="Final Term" data={finalTerm} />
          </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={[styles.cancelBtn]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveBtn,
              (!isMidValid || !isFinalValid) && { backgroundColor: '#9CA3AF' },
            ]}
            disabled={!isMidValid || !isFinalValid}
            onPress={savePolicy}
          >
            <Text style={styles.saveText}>Save Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

/* ================= SMALL COMPONENTS ================= */
const CloInput = ({ label, value, onChange }) => (
  <View style={{ flex: 1 }}>
    <Text style={{ fontWeight: '600', marginBottom: 6 }}>{label}</Text>
    <View style={styles.inputBox}>
      <TextInput
        value={String(value)}
        onChangeText={v => onChange(+v || 0)}
        keyboardType="numeric"
        style={styles.inputValue}
      />
      <Text style={styles.percent}>%</Text>
    </View>
  </View>
);

const PolicyBlock = ({ title, data, setData, total, valid }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={[styles.total, !valid && styles.errorText]}>Total: {total}%</Text>
    </View>

    <LevelRow
      label="Easy Level"
      value={data.easy}
      onChange={v => setData({ ...data, easy: v })}
      bg="#D1FAE5"
      dot="#059669"
    />
    <LevelRow
      label="Medium Level"
      value={data.medium}
      onChange={v => setData({ ...data, medium: v })}
      bg="#FEF3C7"
      dot="#D97706"
    />
    <LevelRow
      label="Tough Level"
      value={data.tough}
      onChange={v => setData({ ...data, tough: v })}
      bg="#FEE2E2"
      dot="#DC2626"
    />
  </View>
);

const LevelRow = ({ label, value, onChange, bg, dot }) => (
  <View style={[styles.levelRow, { backgroundColor: bg, borderColor: dot }]}>
    <View style={styles.levelLeft}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <Text style={styles.levelText}>{label}</Text>
    </View>
    <View style={styles.inputBox}>
      <TextInput
        value={String(value)}
        onChangeText={v => onChange(+v || 0)}
        keyboardType="numeric"
        style={styles.inputValue}
      />
      <Text style={styles.percent}>%</Text>
    </View>
  </View>
);

/* ================= SUMMARY CARD ================= */
const SummaryCard = ({ title, data }) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>{title}</Text>
    <View style={styles.summaryRowItem}>
      <View style={[styles.summaryDot, { backgroundColor: '#059669' }]} />
      <Text>Easy {data.easy}%</Text>
    </View>
    <View style={styles.summaryRowItem}>
      <View style={[styles.summaryDot, { backgroundColor: '#D97706' }]} />
      <Text>Medium {data.medium}%</Text>
    </View>
    <View style={styles.summaryRowItem}>
      <View style={[styles.summaryDot, { backgroundColor: '#DC2626' }]} />
      <Text>Tough {data.tough}%</Text>
    </View>
  </View>
);

export default AssessmentPolicy;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#0FAF8F',
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subTitle: { color: '#E0F2F1', marginTop: 4 },

  section: { backgroundColor: '#F1F5F9', margin: 16, borderRadius: 16, padding: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  total: { fontWeight: '600' },

  cloCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 12 },
  cloBadge: { backgroundColor: '#0FAF8F', alignSelf: 'flex-start', paddingHorizontal: 10, borderRadius: 8, marginBottom: 6 },
  cloBadgeText: { color: '#fff', fontWeight: '700' },
  cloDesc: { marginBottom: 10 },
  cloRow: { flexDirection: 'row', gap: 12 },

  levelRow: { borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelLeft: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  levelText: { fontSize: 15, fontWeight: '600' },

  inputBox: { flexDirection: 'row', backgroundColor: '#2E2E38', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  inputValue: { color: '#fff', fontWeight: '700', marginRight: 4 },
  percent: { color: '#fff' },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  saveBtn: { backgroundColor: '#0FAF8F', padding: 14, borderRadius: 12, flex: 1, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },

  cancelBtn: { backgroundColor: '#E5E7EB', padding: 14, borderRadius: 12, flex: 1, alignItems: 'center' },
  cancelText: { color: '#111', fontWeight: '700' },

  errorText: { color: '#DC2626', fontWeight: '700' },

  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },

  summaryCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, width: '48%' },

  summaryTitle: { fontWeight: '700', fontSize: 16, marginBottom: 10 },

  summaryRowItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },

  summaryDot: { width: 14, height: 14, borderRadius: 7, marginRight: 8 },
});
