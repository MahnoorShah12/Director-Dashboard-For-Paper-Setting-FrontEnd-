import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";

import axios from "axios";
 import RNHTMLtoPDF from "react-native-html-to-pdf";


import { BASE_URL } from "../../config/Api";
import { useNavigation } from "@react-navigation/native";

import { pick, types, isCancel } from "@react-native-documents/picker";
import DateTimePicker from '@react-native-community/datetimepicker';

const MeetingScheduleByTimeTable = () => {
  const navigation = useNavigation();

  const [file, setFile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("16:00");
  const [slotDuration, setSlotDuration] = useState(20);

  const [issues, setIssues] = useState([]);
  const [showIssues, setShowIssues] = useState(false);
  
  const [showPicker, setShowPicker] = useState(false);
const [pickerMode, setPickerMode] = useState("date"); // date or time
const [currentField, setCurrentField] = useState(null);

const [importReport, setImportReport] = useState(null);
const [showReport, setShowReport] = useState(false);


console.log("PDF LIB:", RNHTMLtoPDF);
const openPicker = (mode, field) => {
  setPickerMode(mode);
  setCurrentField(field);
  setShowPicker(true);
};



const normalizeImportResponse = (data) => ({
  message: data.message,
  sessionUsed: data.sessionUsed,
  summary: data.summary,
  missingTeachers: data.missingTeachersInDB || [],
  invalidRows: data.invalidRows || [],
  duplicateSkipped: data.duplicateSkipped || [],
});

const onChange = (event, selectedDate) => {
  setShowPicker(false);

  if (!selectedDate) return;

  const formatted =
    pickerMode === "date"
      ? selectedDate.toISOString().split("T")[0]
      : selectedDate.toTimeString().slice(0, 5);

  if (currentField === "startDate") setStartDate(formatted);
  if (currentField === "endDate") setEndDate(formatted);
  if (currentField === "startTime") setStartTime(formatted);
  if (currentField === "endTime") setEndTime(formatted);
};



// const downloadPDF = () => {
//   if (!meetings.length) {
//     Alert.alert("Error", "No meetings to export");
//     return;
//   }

//   const doc = new jsPDF();

//   doc.setFontSize(16);
//   doc.text("Meeting Schedule", 14, 15);

//   const tableColumn = ["Teacher", "Date", "Start", "End"];

//   const tableRows = meetings.map(m => [
//     m.TeacherName,
//     new Date(m.Date).toLocaleDateString(),
//     m.StartTime,
//     m.EndTime,
//   ]);

//   autoTable(doc, {
//     head: [tableColumn],
//     body: tableRows,
//     startY: 25,
//   });

//   doc.save("Meeting_Schedule.pdf");
// };



// const downloadPDF = async () => {
//   let html = `
//     <h1>Meeting Schedule</h1>
//     <table border="1" cellspacing="0" cellpadding="5">
//       <tr>
//         <th>Teacher</th>
//         <th>Date</th>
//         <th>Start</th>
//         <th>End</th>
//       </tr>
//       ${meetings
//         .map(
//           m => `
//         <tr>
//           <td>${m.TeacherName}</td>
//           <td>${m.Date}</td>
//           <td>${m.StartTime}</td>
//           <td>${m.EndTime}</td>
//         </tr>
//       `
//         )
//         .join("")}
//     </table>
//   `;

//   const options = {
//     html,
//     fileName: "Meeting_Schedule",
//     directory: "Documents",
//   };

//   const file = await RNHTMLtoPDF.convert(options);

//   Alert.alert("PDF saved at", file.filePath);
// };

// console.log("RNHTMLtoPDF =", RNHTMLtoPDF);
// console.log("TYPE =", typeof RNHTMLtoPDF);
const downloadPDF = async () => {
  try {
    if (!meetings.length) {
      Alert.alert("Error", "No meetings found");
      return;
    }

    const html = `
      <html>
        <body>
          <h2 style="color:green;">Meeting Schedule</h2>

          <table border="1" style="width:100%; border-collapse: collapse;">
            <tr>
              <th>Teacher</th>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
            </tr>

            ${meetings.map(m => `
              <tr>
                <td>${m.TeacherName || ""}</td>
                <td>${m.Date || ""}</td>
                <td>${m.StartTime || ""}</td>
                <td>${m.EndTime || ""}</td>
              </tr>
            `).join("")}

          </table>
        </body>
      </html>
    `;

    const options = {
      html,
      fileName: `Meeting_Schedule_${Date.now()}`,
      base64: true,   // 🔥 IMPORTANT FIX
    };

    const file = await RNHTMLtoPDF.convert(options);

    console.log("PDF FILE:", file);

    Alert.alert("Success", "PDF generated successfully");

  } catch (error) {
    console.log("PDF ERROR FULL:", error);
    Alert.alert("Error", error?.message || "PDF generation failed");
  }
};
  // ================= FETCH =================
  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/TeacherFreeSlots`);
      setSlots(res.data || []);
    } catch (e) {
      Alert.alert("Error", "Failed to load slots");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // ================= IMPORT FILE =================
  // const handleImport = async () => {
  //   try {
  //     const result = await pick({
  //       type: [types.xlsx, types.xls],
  //     });

  //     const selectedFile = result[0];
  //     setFile(selectedFile);

  //     const formData = new FormData();

  //     formData.append("file", {
  //       uri: selectedFile.uri,
  //       name: selectedFile.name,
  //       type:
  //         selectedFile.type ||
  //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });

  //     setLoading(true);

  //     const res = await axios.post(
  //       `${BASE_URL}/TeacherFreeSlots/import`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     Alert.alert("Success", res.data?.message || "Imported successfully");
  //     fetchSlots();
  //   } catch (e) {
  //     if (!isCancel(e)) {
  //       console.log(e);
  //       Alert.alert("Error", "Import failed");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleImport = async () => {
  try {
    const result = await pick({ type: [types.xlsx, types.xls] });

    const selected = result[0];
    setFile(selected);

    const formData = new FormData();
    formData.append("file", {
      uri: selected.uri,
      name: selected.name,
      type: selected.type,
    });

    setLoading(true);

    const res = await axios.post(
      `${BASE_URL}/TeacherFreeSlots/import`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const normalized = normalizeImportResponse(res.data);

    setImportReport(normalized);
    setShowReport(true);

    Alert.alert("Success", "Imported Successfully");

    fetchSlots();
  } catch (e) {
    if (!isCancel(e)) Alert.alert("Error", "Import Failed");
  } finally {
    setLoading(false);
  }
};
const downloadImportReport = (report) => {
  const lines = [];

  lines.push("TEACHER TIMETABLE IMPORT REPORT\n");

  lines.push(`Message: ${report.message}`);
  lines.push(`Session Used: ${report.sessionUsed}`);

  lines.push("\nSUMMARY");
  lines.push(`Success: ${report.summary.successRows}`);
  lines.push(`Missing: ${report.summary.missingTeachers}`);
  lines.push(`Invalid: ${report.summary.invalidRows}`);

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "import-report.txt";
  a.click();
};
const deleteTimetable = async () => {
  Alert.alert(
    "Confirm Delete",
    "Are you sure you want to delete the entire timetable?",
    [
      { text: "Cancel", style: "cancel" },

      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await axios.delete(
              `${BASE_URL}/TeacherFreeSlots/clear`
            );

            Alert.alert(
              "Success",
              res.data?.message || "Timetable deleted successfully"
            );

            fetchSlots(); // refresh list
          } catch (err) {
            console.log(err);
            Alert.alert("Error", "Failed to delete timetable");
          }
        },
      },
    ]
  );
};

  // ================= GENERATE =================
  // const handleGenerate = async () => {
  //   try {
  //     setGenerating(true);

  //     const payload = {
  //       startDate,
  //       endDate,
  //       startTime,
  //       endTime,
  //       slotDuration,
  //       senderId: 1,
  //     };

  //     const res = await axios.post(
  //       `${BASE_URL}/Meetings/GenerateSchedule`,
  //       payload
  //     );

  //     setMeetings(res.data.Meetings || []);

  //     if (res.data.Issues?.length > 0) {
  //       setIssues(res.data.Issues);
  //       setShowIssues(true);
  //     }

  //     Alert.alert("Done", "Schedule generated");
  //   } catch (e) {
  //     console.log(e);
  //     Alert.alert("Error", "Generation failed");
  //   } finally {
  //     setGenerating(false);
  //   }
  // };

  const handleGenerate = async () => {
  try {
    setGenerating(true);

    const payload = {
      startDate,
      endDate,
      startTime,
      endTime,
      slotDuration,
      senderId: 1,
    };

    const res = await axios.post(
      `${BASE_URL}/Meetings/GenerateSchedule`,
      payload
    );

    setMeetings(res.data.Meetings || []);

    if (res.data.Issues?.length) {
      setIssues(res.data.Issues);
      setShowIssues(true);
    }

    Alert.alert("Done", "Schedule generated");
  } catch {
    Alert.alert("Error", "Generation failed");
  } finally {
    setGenerating(false);
  }
};
  // ================= RENDER SLOT =================
  const renderSlot = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.TeacherName}</Text>
      <Text>{item.Day}</Text>
      <Text>{item.StartTime} - {item.EndTime}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.header}>Teacher Timetable</Text>

      {/* IMPORT */}
      <View style={styles.cardBox}>
        <Text style={styles.sectionTitle}>Import Excel</Text>

        <TouchableOpacity style={styles.btn} onPress={handleImport}>
          <Text style={{ color: "#fff" }}>
            {loading ? "Uploading..." : "Select & Import File"}
          </Text>
        </TouchableOpacity>

        {file && (
          <Text style={{ marginTop: 5 }}>
            Selected: {file.name}
          </Text>
        )}
      </View>

      {/* SLOTS
      <Text style={styles.sectionTitle}>Teacher Slots</Text>

      <FlatList
        data={slots}
        keyExtractor={(item) => item.Id?.toString()}
        renderItem={renderSlot}
      /> */}

      {/* DELETE BUTTON (TOP of slots) */}
<TouchableOpacity style={styles.btnRed} onPress={deleteTimetable}>
  <Text style={{ color: "#fff", fontWeight: "bold" }}>
    Delete All Timetable
  </Text>
</TouchableOpacity>

{/* SLOTS */}
<Text style={styles.sectionTitle}>Teacher Slots</Text>

<FlatList
  data={slots}
  keyExtractor={(item) => item.Id?.toString()}
  renderItem={renderSlot}
/>

     <View style={styles.cardBox}>
  <Text style={styles.sectionTitle}>Schedule Configuration</Text>

 <TouchableOpacity
  style={styles.input}
  onPress={() => openPicker("date", "startDate")}
>
  <Text>{startDate || "Select Start Date"}</Text>
</TouchableOpacity>

 <TouchableOpacity
  style={styles.input}
  onPress={() => openPicker("date", "endDate")}
>
  <Text>{endDate || "Select End Date"}</Text>
</TouchableOpacity>

  {/* <Text style={styles.label}>⏰ Working Start Time</Text>
  <TextInput
    placeholder="10:00"
    style={styles.input}
    value={startTime}
    onChangeText={setStartTime}
  /> */}
  <TouchableOpacity
  style={styles.input}
  onPress={() => openPicker("time", "startTime")}
>
  <Text>{startTime || "Select Start Time"}</Text>
</TouchableOpacity>
{/* 
  <Text style={styles.label}>⏰ Working End Time</Text>
  <TextInput
    placeholder="16:00"
    style={styles.input}
    value={endTime}
    onChangeText={setEndTime}
  /> */}
  <TouchableOpacity
  style={styles.input}
  onPress={() => openPicker("time", "endTime")}
>
  <Text>{endTime || "Select End Time"}</Text>
</TouchableOpacity>

  <Text style={styles.label}>⏱ Slot Duration (minutes)</Text>
  <TextInput
    placeholder="20"
    style={styles.input}
    keyboardType="numeric"
    value={slotDuration.toString()}
    onChangeText={(text) => setSlotDuration(Number(text))}
  />

  <TouchableOpacity style={styles.btnGreen} onPress={handleGenerate}>
    <Text style={{ color: "#fff" }}>
      {generating ? "Generating..." : "Generate Schedule"}
    </Text>
  </TouchableOpacity>
</View>

<TouchableOpacity style={styles.btnGreen} onPress={downloadPDF}>
  <Text style={{ color: "#fff" }}>Download PDF</Text>
</TouchableOpacity>


      {/* MEETINGS */}
      {meetings.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Meetings</Text>

          {meetings.map((m, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.name}>{m.TeacherName}</Text>
              <Text>{m.Date}</Text>
              <Text>{m.StartTime} - {m.EndTime}</Text>
            </View>
          ))}
        </View>
      )}

      {showPicker && (
  <DateTimePicker
    value={new Date()}
    mode={pickerMode}
    display="default"
    onChange={onChange}
  />
)}

      {/* ISSUES MODAL */}
      <Modal visible={showIssues} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalBox}>

            <Text style={styles.sectionTitle}>Issues</Text>

            {issues.map((i, idx) => (
              <Text key={idx}>
                {i.TeacherName} - {i.Issue}
              </Text>
            ))}

            <TouchableOpacity
              style={styles.btn}
              onPress={() => setShowIssues(false)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

export default MeetingScheduleByTimeTable;
const styles = {
  container: { flex: 1, backgroundColor: "#e8f5e9", padding: 12 },

  header: { fontSize: 22, fontWeight: "bold", color: "#1b5e20" },

  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#2e7d32" },

  cardBox: { backgroundColor: "#fff", padding: 12, borderRadius: 12 },

  card: { backgroundColor: "#fff", padding: 10, borderRadius: 10, marginBottom: 8 },

  name: { fontWeight: "bold", color: "#1b5e20" },

  input: { borderWidth: 1, borderColor: "#c8e6c9", padding: 10, borderRadius: 8 },

  btn: { backgroundColor: "#2e7d32", padding: 10, borderRadius: 8, alignItems: "center" },

  btnGreen: { backgroundColor: "#4caf50", padding: 12, borderRadius: 8 },

  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
  },
  btnRed: {
  backgroundColor: "#d32f2f",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
  marginVertical: 10,
}
};