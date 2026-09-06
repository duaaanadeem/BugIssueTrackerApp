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

export default function IssuesScreen({
  route,
  navigation,
}) {
  const { token } = useContext(AuthContext);
  const { projectId } = route.params;

  const [issues, setIssues] = useState([]);

  const loadIssues = async () => {
    try {
      const data = await apiRequest(
        `/issues?projectId=${projectId}`,
        "GET",
        null,
        token
      );

      setIssues(data.issues || []);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "focus",
      loadIssues
    );

    return unsubscribe;
  }, [navigation, token, projectId]);

  return (
    <View style={styles.container}>
      <Button
        title="Create Issue"
        onPress={() =>
          navigation.navigate("CreateIssue", {
            projectId,
          })
        }
      />

      <FlatList
        data={issues}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No issues found.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.title}
            </Text>

            <Text>
              {item.description}
            </Text>

            <Text>
              Priority: {item.priority}
            </Text>

            <Text>
              Status: {item.status}
            </Text>

            <Button
              title="View Issue"
              onPress={() =>
                navigation.navigate(
                  "IssueDetails",
                  {
                    issueId: item._id,
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

  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
  },
});