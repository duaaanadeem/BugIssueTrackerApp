import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
} from "react-native";

import { AuthContext } from "../context/authcontext";
import { apiRequest } from "../services/api";

export default function ProjectDetailsScreen({
  route,
  navigation,
}) {
  const { token } = useContext(AuthContext);
  const { projectId } = route.params;

  const [project, setProject] = useState(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await apiRequest(
          `/projects/${projectId}`,
          "GET",
          null,
          token
        );

        setProject(data.project);
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    };

    loadProject();
  }, [projectId, token]);

  if (!project) {
    return (
      <View style={styles.container}>
        <Text>Loading project...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {project.name}
      </Text>

      <Text style={styles.description}>
        {project.description || "No description available"}
      </Text>

      <View style={styles.space} />

      <Button
        title="View Issues"
        onPress={() =>
          navigation.navigate("Issues", {
            projectId: projectId,
          })
        }
      />

      <View style={styles.space} />

      <Button
        title="Create Issue"
        onPress={() =>
          navigation.navigate("CreateIssue", {
            projectId: projectId,
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },

  description: {
    fontSize: 16,
    color: "#555",
  },

  space: {
    height: 15,
  },
});