import React, {
  useContext,
  useState,
} from "react";

import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";

import { AuthContext } from "../context/authcontext";
import { apiRequest } from "../services/api";

export default function CreateIssueScreen({
  route,
  navigation,
}) {
  const { token } = useContext(AuthContext);
  const { projectId } = route.params;

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const createIssue = async () => {
    if (!title.trim()) {
      Alert.alert(
        "Error",
        "Issue title is required"
      );
      return;
    }

    try {
      await apiRequest(
        "/issues",
        "POST",
        {
          projectId,
          title: title.trim(),
          description: description.trim(),
          priority: "Medium",
          status: "Open",
        },
        token
      );

      Alert.alert(
        "Success",
        "Issue created successfully"
      );

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Issue title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Issue description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.input}
      />

      <Button
        title="Create Issue"
        onPress={createIssue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
});