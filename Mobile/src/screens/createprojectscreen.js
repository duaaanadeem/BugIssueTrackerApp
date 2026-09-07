import React, {
  useContext,
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
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

import { AuthContext } from "../context/authcontext";

import { apiRequest } from "../services/api";

export default function CreateProjectScreen({
  navigation,
}) {
  const { token } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    Keyboard.dismiss();

    if (!name.trim()) {
      Alert.alert(
        "Project name required",
        "Please enter a name for your project."
      );
      return;
    }

    if (name.trim().length < 3) {
      Alert.alert(
        "Invalid name",
        "Project name must be at least 3 characters."
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        "Description required",
        "Please describe what this project is about."
      );
      return;
    }

    try {
      setSubmitting(true);

      const data = await apiRequest(
        "/projects",
        "POST",
        {
          name: name.trim(),
          description: description.trim(),
        },
        token
      );

      Alert.alert(
        "Project created",
        "Your project has been created successfully.",
        [
          {
            text: "View Project",
            onPress: () =>
              navigation.replace(
                "ProjectDetails",
                {
                  projectId: data.project._id,
                }
              ),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Unable to create project",
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
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Create a project
        </Text>

        <Text style={styles.subtitle}>
          Set up a new project so your team can
          start reporting and tracking issues.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Project Name
          </Text>

          <TextInput
            placeholder="e.g. Mobile App Redesign"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!submitting}
          />

          <Text style={styles.label}>
            Description
          </Text>

          <TextInput
            placeholder="What is this project about?"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            style={[
              styles.input,
              styles.textarea,
            ]}
            multiline
            textAlignVertical="top"
            editable={!submitting}
          />

          <Pressable
            style={[
              styles.button,
              submitting && styles.disabled,
            ]}
            onPress={handleCreate}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Create Project
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