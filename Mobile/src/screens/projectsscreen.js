import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import { AuthContext } from "../context/authcontext";
import { apiRequest } from "../services/api";

export default function ProjectsScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);

  const loadProjects = async () => {
    try {
      const data = await apiRequest(
        "/projects",
        "GET",
        null,
        token
      );

      setProjects(data.projects || []);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "focus",
      loadProjects
    );

    return unsubscribe;
  }, [navigation, token]);

  return (
    <View style={styles.container}>
      <Button
        title="Create Project"
        onPress={() =>
          navigation.navigate("CreateProject")
        }
      />

      <FlatList
        data={projects}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No projects found.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.name}
            </Text>

            <Text>
              {item.description || "No description"}
            </Text>

            <Button
              title="View Project"
              onPress={() =>
                navigation.navigate(
                  "ProjectDetails",
                  {
                    projectId: item._id,
                  }
                )
              }
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },

  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 15,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
  },
});