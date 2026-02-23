import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { BASE_URL } from "../../config/Api";

const VettingAlerts = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [alphabetRange, setAlphabetRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [vettingDate, setVettingDate] = useState(null);
  const [vettingTime, setVettingTime] = useState(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showVettingDatePicker, setShowVettingDatePicker] = useState(false);
  const [showVettingTimePicker, setShowVettingTimePicker] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [vettingErrors, setVettingErrors] = useState([]);
    // const [Message, setMessage] = useState([]);
    const [message, setMessage] = useState("");       // Message text
const [messageType, setMessageType] = useState(""); // "error" ya "success"

  const senderId = 1;
  const alphabetButtons = [["A","D"],["E","H"],["I","L"],["M","P"],["Q","T"],["U","Z"]];

  // ======= LOAD TEACHERS =======
  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/DirectorAlert/teachers-with-courses`);
      console.log("Teachers API response:", res.data);

      const data = Array.isArray(res.data)
        ? res.data.map(t => ({
            id: Number(t.id),          // Ensure numeric
            name: t.name || "",
            courses: t.courses || []
          }))
        : [];

      setTeachers(data);
      setFilteredTeachers(data);
    } catch (error) {
      console.log("Error loading teachers:", error.response?.data || error.message);
      Alert.alert("Error","Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTeachers(); }, [loadTeachers]);

  // ======= ALPHABET FILTER =======
  useEffect(() => {
    if (!alphabetRange.start) {
      setFilteredTeachers(teachers);
      return;
    }
    const filtered = teachers.filter(t => {
      const firstChar = t.name?.charAt(0).toUpperCase();
      return firstChar >= alphabetRange.start && firstChar <= alphabetRange.end;
    });
    setFilteredTeachers(filtered);
  }, [alphabetRange, teachers]);

  // ======= TEACHER TOGGLE =======
  const toggleTeacher = (id) => {
    setSelectedTeachers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const clearAllSelections = () => {
    setSelectedTeachers([]);
    setAlphabetRange({ start: "", end: "" });
  };

  
const sendSubmissionPeriod = async () => {
  if (!startDate || !endDate) {
    setVettingErrors(["Please select start and end dates"]);
    return;
  }

  if (startDate > endDate) {
    setVettingErrors(["Start date must be before end date"]);
    return;
  }

  try {
    setLoading(true);
    setVettingErrors([]);

    const payload = {
      StartDate: startDate.toISOString(),
      EndDate: endDate.toISOString(),
      SenderId: senderId,
      SessionId: null
    };

    const res = await axios.post(
      `${BASE_URL}/DirectorAlert/submission-period/send`,
      payload
    );

    let message = "Submission period alert sent to all teachers";

    if (typeof res.data === "string") {
      message = res.data;
    } else if (res.data?.Message) {
      message = res.data.Message;
    }

    // Success bhi yahin show karwa dein
    setVettingErrors([message]);

    setStartDate(null);
    setEndDate(null);

  } catch (error) {
    let errorMsg = "Failed to send submission period";

    if (typeof error.response?.data === "string") {
      errorMsg = error.response.data;
    } else if (error.response?.data?.Message) {
      errorMsg = error.response.data.Message;
    }

    setVettingErrors([errorMsg]);

  } finally {
    setLoading(false);
  }
};
//   // ======= ASSIGN VETTING =======
  const assignVetting = async () => {
    if (!vettingDate) return Alert.alert("Error","Select vetting date");
    if (selectedTeachers.length === 0) return Alert.alert("Error","Select at least one teacher");

    try {
      setLoading(true);
      setVettingErrors([]);

      // Convert IDs to numbers
      const teacherIds = selectedTeachers.map(id => Number(id));

      // Format time as HH:mm:ss
      let formattedTime = null;
      if (vettingTime) {
        const [h, m] = vettingTime.split(":");
        formattedTime = `${h.padStart(2,"0")}:${m.padStart(2,"0")}:00`;
      }

      const res = await axios.post(`${BASE_URL}/DirectorAlert/vetting/assign-group`, {
        VettingDate: vettingDate.toISOString(),
        VettingTime: formattedTime,
        SenderId: senderId,
        TeacherIds: teacherIds,
        SessionId: null
      });

      const data = res.data;
      setSuccessMessage(data.Message || `Vetting assigned to ${teacherIds.length} teachers`);
      setModalVisible(true);

      const failedItems = data.Details?.filter(d => d.Status === "Failed") || [];
      setVettingErrors(failedItems);

      setSelectedTeachers([]);
      setAlphabetRange({ start: "", end: "" });
      setVettingDate(null);
      setVettingTime(null);

    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert("Error","Failed to assign vetting");
    } finally {
      setLoading(false);
    }
  };
//   const assignVetting = async () => {
//   // Validate vetting date/time
//   if (!vettingDate && !vettingTime) {
//     setMessage("Please select vetting date and/or time");
//     setMessageType("error");
//     return;
//   }

//   if (selectedTeachers.length === 0) {
//     setMessage("Please select at least one teacher");
//     setMessageType("error");
//     return;
//   }

//   try {
//     setLoading(true);
//     setVettingErrors([]);

//     // Teacher IDs numeric me convert
//     const teacherIds = selectedTeachers.map(id => Number(id));

//     // Time ko HH:mm:ss format me convert
//     let formattedTime = null;
//     if (vettingTime) {
//       const [h, m] = vettingTime.split(":");
//       formattedTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;
//     }

//     // API call
//     const res = await axios.post(
//       `${BASE_URL}/DirectorAlert/vetting/assign-group`,
//       {
//         VettingDate: vettingDate ? vettingDate.toISOString() : null,
//         VettingTime: formattedTime,
//         SenderId: senderId,
//         TeacherIds: teacherIds,
//         SessionId: null
//       }
//     );

//     const data = res.data;

//     // Success message show karna
//     setMessage(data.Message || `Vetting assigned to ${teacherIds.length} teacher(s)`);
//     setMessageType("success");

//     // Failed items
//     const failedItems = data.Details?.filter(d => d.Status === "Failed") || [];
//     setVettingErrors(failedItems);

//     // Reset selections
//     setSelectedTeachers([]);
//     setAlphabetRange({ start: "", end: "" });
//     setVettingDate(null);
//     setVettingTime(null);

//   } catch (error) {
//     console.error(error.response?.data || error.message);
//     setMessage("Failed to assign vetting");
//     setMessageType("error");
//   } finally {
//     setLoading(false);
//   }
// };

  // ======= RENDER TEACHERS =======
  const renderTeacher = ({ item }) => {
    const selected = selectedTeachers.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.teacherCard, selected && styles.teacherSelected]}
        onPress={() => toggleTeacher(item.id)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{item.name?.charAt(0) || ""}</Text>
        </View>
        <View style={{flex:1}}>
          <Text style={styles.teacherName}>{item.name || ""}</Text>
          <Text style={styles.teacherCourse}>{(item.courses?.join(", ") || "No course assigned")}</Text>
        </View>
        {selected && <Ionicons name="checkmark-circle" size={24} color="#0f9d58"/>}
      </TouchableOpacity>
    );
  };

  const selectedCount = selectedTeachers.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vetting & Alert Managment </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Submission Period */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Submission Period </Text>

          <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
            <Ionicons name="calendar-outline" size={18}/>
            <Text style={styles.inputTxt}>{startDate ? startDate.toDateString() : "Start Date"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.input} onPress={() => setShowEndPicker(true)}>
            <Ionicons name="calendar-outline" size={18}/>
            <Text style={styles.inputTxt}>{endDate ? endDate.toDateString() : "End Date"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={sendSubmissionPeriod}>
            <Text style={styles.primaryTxt}>Send Alert to All Teachers</Text>
          </TouchableOpacity>
        </View>
        {message !== "" && (
  <View style={{ padding: 10, margin: 10, backgroundColor: messageType === "error" ? "#f8d7da" : "#d1e7dd", borderRadius: 8 }}>
    <Text style={{ color: messageType === "error" ? "#842029" : "#0f5132" }}>
      {message}
    </Text>
  </View>
)}
{vettingErrors.length > 0 && (
  <View style={{ marginTop: 10 }}>
    {vettingErrors.map((err, index) => (
      <Text key={index} style={{ color: "red", marginBottom: 4 }}>
        {err}
      </Text>
    ))}
  </View>
  
)}
        {/* Alphabet Filter */}
        <View style={styles.cardPurple}>
          <Text style={styles.sectionTitle}>Filter Teachers by Alphabet</Text>
          <View style={styles.alphabetWrap}>
            {alphabetButtons.map(([s,e]) => (
              <TouchableOpacity
                key={s}
                style={[styles.alphaBtn, alphabetRange.start === s && styles.alphaActive]}
                onPress={() => setAlphabetRange({start: s, end: e})}
              >
                <Text style={styles.alphaTxt}>{s} – {e}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.secondaryBtn} onPress={clearAllSelections}>
            <Text>Clear Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Vetting Assignment */}
        <View style={styles.cardBlue}>
          <Text style={styles.sectionTitle}>Assign Vetting Date & Time</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowVettingDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18}/>
            <Text style={styles.inputTxt}>{vettingDate ? vettingDate.toDateString() : "Vetting Date"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.input} onPress={() => setShowVettingTimePicker(true)}>
            <Ionicons name="time-outline" size={18}/>
            <Text style={styles.inputTxt}>{vettingTime ? vettingTime.toString() : "Vetting Time"}</Text>
          </TouchableOpacity>

          <Text style={{marginVertical:6}}>
            {selectedCount} teacher{selectedCount !== 1 ? "s" : ""} selected
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={assignVetting} disabled={selectedCount === 0}>
            <Text style={styles.primaryTxt}>Assign Vetting & Notify</Text>
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator size="large"/> :
          <FlatList
            data={filteredTeachers}
      
            keyExtractor={i => i.id.toString()}
            renderItem={renderTeacher}

            scrollEnabled={false}
          />
        }
        

      </ScrollView>

      {/* PICKERS */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          onChange={(e,d) => {setShowStartPicker(false); if(d) setStartDate(d);}}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          onChange={(e,d) => {setShowEndPicker(false); if(d) setEndDate(d);}}
        />
      )}
      {showVettingDatePicker && (
        <DateTimePicker
          value={vettingDate || new Date()}
          mode="date"
          onChange={(e,d) => {setShowVettingDatePicker(false); if(d) setVettingDate(d);}}
        />
      )}
      {showVettingTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          onChange={(e,t) => {setShowVettingTimePicker(false); if(t) setVettingTime(t.toLocaleTimeString("en-GB"));}}
        />
      )}

      {/* SUCCESS MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalBox}>
            <Ionicons name="notifications" size={60} color="#0f9d58"/>
            <Text style={{marginVertical:12, textAlign:"center"}}>{successMessage}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.primaryTxt}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VettingAlerts;

const styles=StyleSheet.create({
container:{flex:1,backgroundColor:"#f2f4f7"},
header:{backgroundColor:"#0f9d58",padding:16,paddingTop:40,borderBottomLeftRadius:18,borderBottomRightRadius:18},
headerTitle:{color:"#fff",fontSize:20,fontWeight:"bold",textAlign:"center"},
cardPurple:{backgroundColor:"#f3e8ff",margin:14,padding:14,borderRadius:14},
cardBlue:{backgroundColor:"#e0f2fe",margin:14,padding:14,borderRadius:14},
card:{backgroundColor:"#fff",margin:14,padding:14,borderRadius:14},
sectionTitle:{fontWeight:"bold",marginBottom:10,color:"#333"},
input:{flexDirection:"row",alignItems:"center",gap:8,backgroundColor:"#fff",padding:12,borderRadius:10,marginVertical:6,borderWidth:1,borderColor:"#e5e7eb"},
inputTxt:{marginLeft:8,color:"#555"},
primaryBtn:{backgroundColor:"#0f9d58",padding:13,borderRadius:10,marginTop:10,alignItems:"center"},
primaryTxt:{color:"#fff",fontWeight:"bold"},
secondaryBtn:{backgroundColor:"#ddd",padding:10,borderRadius:10,alignItems:"center",marginTop:6},
alphabetWrap:{flexDirection:"row",flexWrap:"wrap",gap:8},
alphaBtn:{paddingVertical:6,paddingHorizontal:12,backgroundColor:"#fff",borderRadius:20,borderWidth:1,borderColor:"#ddd"},
alphaActive:{backgroundColor:"#0f9d58"},
alphaTxt:{color:"#333"},
teacherCard:{flexDirection:"row",alignItems:"center",backgroundColor:"#fff",marginHorizontal:14,marginVertical:6,padding:12,borderRadius:12},
teacherSelected:{borderWidth:2,borderColor:"#0f9d58"},
avatar:{width:38,height:38,borderRadius:19,backgroundColor:"#0f9d58",alignItems:"center",justifyContent:"center",marginRight:10},
avatarTxt:{color:"#fff",fontWeight:"bold"},
teacherName:{fontWeight:"bold"},
teacherCourse:{fontSize:12,color:"#666"},
modalWrap:{flex:1,backgroundColor:"rgba(0,0,0,0.4)",justifyContent:"center",alignItems:"center"},
modalBox:{backgroundColor:"#fff",padding:25,borderRadius:16,width:"80%",alignItems:"center"}
});