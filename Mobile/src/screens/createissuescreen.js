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
  Image,
  Keyboard,
  TouchableWithoutFeedback,
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
  const { token } =
    useContext(AuthContext);

  const { projectId } =
    route.params;

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState("Medium");

  const [status, setStatus] =
    useState("Open");

  const [users, setUsers] =
    useState([]);

  const [assignedTo, setAssignedTo] =
    useState(null);

  const [screenshot, setScreenshot] =
    useState(null);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await apiRequest(
          "/auth/users",
          "GET",
          null,
          token
        );

        setUsers(data.users || []);
      } catch (error) {
        Alert.alert(
          "Unable to load users",
          error.message
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [token]);

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to attach a screenshot."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync(
        {
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.6,
          base64: true,
        }
      );

    if (
      !result.canceled &&
      result.assets?.length
    ) {
      const asset = result.assets[0];

      if (!asset.base64) {
        Alert.alert(
          "Screenshot error",
          "The selected image could not be processed."
        );
        return;
      }

      const mimeType =
        asset.mimeType ||
        "image/jpeg";

      setScreenshot(
        `data:${mimeType};base64,${asset.base64}`
      );
    }
  };

  const createIssue = async () => {
    Keyboard.dismiss();

    if (!title.trim()) {
      Alert.alert(
        "Title required",
        "Please enter an issue title."
      );
      return;
    }

    if (title.trim().length < 3) {
      Alert.alert(
        "Invalid title",
        "Issue title must be at least 3 characters."
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        "Description required",
        "Please describe the issue."
      );
      return;
    }

    if (description.trim().length < 5) {
      Alert.alert(
        "Description too short",
        "Please provide more details about the issue."
      );
      return;
    }

    try {
      setSubmitting(true);

      await apiRequest(
        "/issues",
        "POST",
        {
          projectId,
          title: title.trim(),
          description:
            description.trim(),
          screenshots: screenshot
            ? [screenshot]
            : [],
          priority,
          status,
          assignedTo:
            assignedTo?._id || null,
        },
        token
      );

      Alert.alert(
        "Issue reported",
        "The issue has been created successfully.",
        [
          {
            text: "View Issues",
            onPress: () =>
              navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Unable to create issue",
        error.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Report an issue
        </Text>

        <Text style={styles.subtitle}>
          Provide enough detail so your team
          can understand and resolve it.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Issue Title
          </Text>

          <TextInput
            placeholder="e.g. Login button not working"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>
            Description
          </Text>

          <TextInput
            placeholder="Describe what happened, expected behavior, and steps to reproduce..."
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            style={[
              styles.input,
              styles.textarea,
            ]}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>
            Priority
          </Text>

          <View style={styles.chips}>
            {priorities.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.chip,
                  priority === item &&
                    styles.activeChip,
                ]}
                onPress={() =>
                  setPriority(item)
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    priority === item &&
                      styles.activeChipText,
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

          <View style={styles.chips}>
            {statuses.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.chip,
                  status === item &&
                    styles.activeChip,
                ]}
                onPress={() =>
                  setStatus(item)
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    status === item &&
                      styles.activeChipText,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>
            Assign To
          </Text>

          {loadingUsers ? (
            <View style={styles.userLoading}>
              <ActivityIndicator
                size="small"
                color="#111827"
              />

              <Text
                style={
                  styles.userLoadingText
                }
              >
                Loading team members...
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              style={styles.usersScroll}
            >
              <Pressable
                style={[
                  styles.userChip,
                  !assignedTo &&
                    styles.activeUser,
                ]}
                onPress={() =>
                  setAssignedTo(null)
                }
              >
                <Text
                  style={[
                    styles.userText,
                    !assignedTo &&
                      styles.activeUserText,
                  ]}
                >
                  Unassigned
                </Text>
              </Pressable>

              {users.map((user) => (
                <Pressable
                  key={user._id}
                  style={[
                    styles.userChip,
                    assignedTo?._id ===
                      user._id &&
                      styles.activeUser,
                  ]}
                  onPress={() =>
                    setAssignedTo(user)
                  }
                >
                  <Text
                    style={[
                      styles.userText,
                      assignedTo?._id ===
                        user._id &&
                        styles.activeUserText,
                    ]}
                  >
                    {user.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <Text style={styles.label}>
            Screenshot
          </Text>

          {screenshot ? (
            <View style={styles.imageBox}>
              <Image
                source={{
                  uri: screenshot,
                }}
                style={styles.image}
              />

              <Pressable
                style={styles.removeImage}
                onPress={() =>
                  setScreenshot(null)
                }
              >
                <Text
                  style={
                    styles.removeImageText
                  }
                >
                  Remove
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.upload}
              onPress={pickImage}
            >
              <Text style={styles.uploadIcon}>
                +
              </Text>

              <Text style={styles.uploadTitle}>
                Attach Screenshot
              </Text>

              <Text style={styles.uploadText}>
                Select an image from your phone
              </Text>
            </Pressable>
          )}

          <Pressable
            style={[
              styles.button,
              submitting &&
                styles.disabled,
            ]}
            onPress={createIssue}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Report Issue
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 7,
    marginBottom: 20,
    lineHeight: 21,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 2,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 8,
    marginTop: 3,
  },

  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
    marginBottom: 18,
  },

  textarea: {
    height: 130,
    paddingTop: 14,
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  chip: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginRight: 7,
    marginBottom: 7,
    backgroundColor: "#F8FAFC",
  },

  activeChip: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  chipText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },

  activeChipText: {
    color: "#fff",
  },

  usersScroll: {
    marginBottom: 18,
  },

  userChip: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginRight: 8,
  },

  activeUser: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  userText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },

  activeUserText: {
    color: "#fff",
  },

  userLoading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  userLoadingText: {
    marginLeft: 8,
    color: "#64748B",
    fontSize: 12,
  },

  upload: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 15,
    padding: 22,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#F8FAFC",
  },

  uploadIcon: {
    fontSize: 28,
    color: "#475569",
    fontWeight: "300",
  },

  uploadTitle: {
    color: "#0F172A",
    fontWeight: "800",
    marginTop: 5,
  },

  uploadText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 3,
  },

  imageBox: {
    marginBottom: 20,
  },

  image: {
    width: "100%",
    height: 210,
    borderRadius: 14,
  },

  removeImage: {
    alignSelf: "flex-end",
    marginTop: 8,
  },

  removeImageText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  button: {
    height: 53,
    backgroundColor: "#111827",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  disabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});