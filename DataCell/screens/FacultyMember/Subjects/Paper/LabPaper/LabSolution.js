

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useRoute } from "@react-navigation/native";
import { BASE_URL } from "../../../../../config/Api";

// ✅ NEW LIBRARY (correct)
import { pick, types, isCancel } from "@react-native-documents/picker";

const BASE = "http://192.168.137.1/fypProject";

const LabSolution = () => {
  const route = useRoute();

  const { paperId, filePath, createPaper } = route.params || {};

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState(filePath || null);

  console.log("createPaper:", createPaper);


  const [paperDetails, setPaperDetails] = useState(null);


  useFocusEffect(
  useCallback(() => {
    getPaperDetails(); // 🔥 har baar screen pe aate hi refresh
  }, [])
);

const getPaperDetails = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/paper/GetPaperDetails/${paperId}`
    );

    setPaperDetails(res.data);
  } catch (err) {
    console.log(err);
  }
};

  // ✅ FIXED PICK FUNCTION
  const pickFile = async () => {
    try {
      const res = await pick({
        type: [types.pdf, types.images],
      });

      console.log("File:", res);
      setFile(res[0]);
    } catch (err) {
      if (isCancel(err)) {
        console.log("User cancelled");
      } else {
        console.log(err);
        Alert.alert("Error", "File pick failed");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert("Error", "Please select a file first");
      return;
    }

    const formData = new FormData();

    formData.append("paper_solution", {
      uri: file.uri,
      type: file.type || "application/octet-stream",
      name: file.name || "file.pdf",
    });

    formData.append("paper_id", paperId);

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}/paper/upload_solution`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("UPLOAD:", res.data);

      Alert.alert("Success", "File uploaded successfully");

      // 🔥 UI update
      setUploadedPath(res.data.path);

      // 🔥 route sync (refresh issue fix)
      if (route.params) {
        route.params.filePath = res.data.path;
      }

      setFile(null);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const fileUrl =
    uploadedPath && uploadedPath !== ""
      ? `${BASE}${uploadedPath}`
      : null;

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Text style={{ color: "#fff" }}>📄</Text>
        </View>

        <View>
          <Text style={styles.title}>Paper Solution</Text>
          <Text style={styles.subTitle}>Upload PDF or Image file</Text>
        </View>
      </View>

      {/* UPLOAD BOX */}
      {createPaper && (
        <View style={styles.uploadRow}>
          <TouchableOpacity style={styles.dropBox} onPress={pickFile}>
            <Text style={styles.dropText}>
              {file ? file.name : "Click to choose file"}
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonBox}>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={handleUpload}
              disabled={loading}
            >
              <Text style={styles.btnText}>
                {loading ? "Uploading..." : "Upload"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* PREVIEW */}
      <View style={styles.previewBox}>
        {fileUrl ? (
          <View style={styles.fileRow}>
            <View>
              <Text style={styles.fileName}>
                {uploadedPath?.endsWith(".pdf")
                  ? "PDF Solution"
                  : "Image Solution"}
              </Text>
              <Text style={styles.fileMeta}>Available for view</Text>
            </View>

            <TouchableOpacity
              onPress={() => Linking.openURL(fileUrl)}
              style={styles.viewBtn}
            >
              <Text style={{ color: "#059669", fontWeight: "600" }}>
                View
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.empty}>No solution uploaded yet</Text>
        )}
      </View>
    </View>
  );
};

export default LabSolution;
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 14,
    margin: 20,
    elevation: 3, // shadow Android
    shadowColor: "#000", // shadow iOS
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  iconBox: {
    width: 38,
    height: 38,
    backgroundColor: "#10b981",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },

  subTitle: {
    fontSize: 12,
    color: "#64748b",
  },

  /* UPLOAD ROW */
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },

  /* DROP AREA */
  dropBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
  },

  dropText: {
    fontSize: 12,
    color: "#64748b",
  },

  /* BUTTON */
  buttonBox: {
    justifyContent: "center",
  },

  uploadBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#10b981",
  },

  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* PREVIEW */
  previewBox: {
    marginTop: 6,
  },

  fileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
  },

  fileName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0f172a",
  },

  fileMeta: {
    fontSize: 10,
    color: "#64748b",
  },

  viewBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#ecfdf5",
  },

  empty: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    padding: 8,
  },
});