import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { AuthContext } from "../context/authcontext";
import { apiRequest } from "../services/api";

const priorities = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const statuses = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
];

export default function CreateIssueScreen({
  route,
  navigation,
}) {
  const { token } = useContext(AuthContext);

  const projectId = route.params?.projectId;

  const [project, setProject] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Open");
  const [assignedTo, setAssignedTo] = useState("");

  const [screenshots, setScreenshots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);

      const data = await apiRequest(
        `/projects/${projectId}`,
        "GET",
        null,
        token
      );

      setProject(data.project);
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Unable to load project."
      );
    } finally {
      setLoading(false);
    }
  };

  const projectUsers = project
    ? [
        ...(project.createdBy
          ? [project.createdBy]
          : []),
        ...(project.members || []),
      ].filter(
        (user, index, self) =>
          user?._id &&
          index ===
            self.findIndex(
              (item) => item._id === user._id
            )
      )
    : [];

  const pickImages = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.7,
        base64: true,
      });

    if (result.canceled) {
      return;
    }

    const selected =
      result.assets
        ?.filter((asset) => asset.base64)
        .map(
          (asset) =>
            `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`
        ) || [];

    setScreenshots(selected);
  };

  const createIssue = async () => {
    if (!title.trim()) {
      Alert.alert(
        "Validation",
        "Please enter an issue title."
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        "Validation",
        "Please enter an issue description."
      );
      return;
    }

    try {
      setCreating(true);

      await apiRequest(
        "/issues",
        "POST",
        {
          projectId,
          title: title.trim(),
          description: description.trim(),
          screenshots,
          priority,
          status,
          assignedTo: assignedTo || null,
        },
        token
      );

      Alert.alert(
        "Success",
        "Issue created successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Unable to create issue."
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#111827"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Report New Issue
      </Text>

      <Text style={styles.projectName}>
        Project: {project?.name || "Project"}
      </Text>

      <Text style={styles.label}>
        Issue Title
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter issue title"
        placeholderTextColor="#94A3B8"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}
        placeholder="Describe the issue"
        placeholderTextColor="#94A3B8"
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>
        Priority
      </Text>

      <View style={styles.chipContainer}>
        {priorities.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.chip,
              priority === item &&
                styles.selectedChip,
            ]}
            onPress={() => setPriority(item)}
          >
            <Text
              style={[
                styles.chipText,
                priority === item &&
                  styles.selectedChipText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>
        Status
      </Text>

      <View style={styles.chipContainer}>
        {statuses.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.chip,
              status === item &&
                styles.selectedChip,
            ]}
            onPress={() => setStatus(item)}
          >
            <Text
              style={[
                styles.chipText,
                status === item &&
                  styles.selectedChipText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>
        Assigned User
      </Text>

      <View style={styles.assignedBox}>
        <Pressable
          style={[
            styles.assignedChip,
            assignedTo === "" &&
              styles.selectedAssignedChip,
          ]}
          onPress={() => setAssignedTo("")}
        >
          <Text
            style={[
              styles.assignedText,
              assignedTo === "" &&
                styles.selectedAssignedText,
            ]}
          >
            Unassigned
          </Text>
        </Pressable>

        {projectUsers.map((user) => (
          <Pressable
            key={user._id}
            style={[
              styles.assignedChip,
              assignedTo === user._id &&
                styles.selectedAssignedChip,
            ]}
            onPress={() =>
              setAssignedTo(user._id)
            }
          >
            <Text
              style={[
                styles.assignedText,
                assignedTo === user._id &&
                  styles.selectedAssignedText,
              ]}
            >
              {user.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>
        Screenshots
      </Text>

      <Pressable
        style={styles.secondaryButton}
        onPress={pickImages}
      >
        <Text style={styles.secondaryButtonText}>
          {screenshots.length > 0
            ? `${screenshots.length} screenshot(s) selected`
            : "Add Screenshots"}
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.createButton,
          creating &&
            styles.disabledButton,
        ]}
        onPress={createIssue}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>
            Create Issue
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 20,
    paddingTop: 35,
    paddingBottom: 45,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },

  projectName: {
    color: "#64748B",
    fontSize: 14,
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 9,
    marginTop: 4,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    color: "#0F172A",
    fontSize: 15,
    marginBottom: 18,
  },

  textArea: {
    height: 120,
    paddingTop: 14,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  chip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
    marginBottom: 8,
  },

  selectedChip: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  chipText: {
    color: "#475569",
    fontWeight: "700",
  },

  selectedChipText: {
    color: "#fff",
  },

  assignedBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    marginBottom: 20,
  },

  assignedChip: {
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderRadius: 11,
    marginBottom: 7,
    backgroundColor: "#F8FAFC",
  },

  selectedAssignedChip: {
    backgroundColor: "#111827",
  },

  assignedText: {
    color: "#334155",
    fontWeight: "700",
  },

  selectedAssignedText: {
    color: "#fff",
  },

  secondaryButton: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  secondaryButtonText: {
    color: "#111827",
    fontWeight: "800",
  },

  createButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  createButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});