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

export default function CreateProjectScreen({
  navigation,
}) {
  const { token } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createProject = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Project name is required");
      return;
    }

    try {
      await apiRequest(
        "/projects",
        "POST",
        {
          name: name.trim(),
          description: description.trim(),
        },
        token
      );

      Alert.alert(
        "Success",
        "Project created successfully"
      );

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Project name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Project description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
      />

      <Button
        title="Create Project"
        onPress={createProject}
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