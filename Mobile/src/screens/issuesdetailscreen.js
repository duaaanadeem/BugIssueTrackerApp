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

export default function IssueDetailsScreen({
  route,
  navigation,
}) {
  const { token } = useContext(AuthContext);
  const { issueId } = route.params;

  const [issue, setIssue] = useState(null);

  useEffect(() => {
    const loadIssue = async () => {
      try {
        const data = await apiRequest(
          `/issues/${issueId}`,
          "GET",
          null,
          token
        );

        setIssue(data.issue);
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    };

    loadIssue();
  }, [issueId, token]);

  if (!issue) {
    return (
      <View style={styles.container}>
        <Text>Loading issue...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {issue.title}
      </Text>

      <Text>
        {issue.description}
      </Text>

      <Text>
        Priority: {issue.priority}
      </Text>

      <Text>
        Status: {issue.status}
      </Text>

      <View style={styles.space} />

      <Button
        title="Comments"
        onPress={() =>
          navigation.navigate("Comments", {
            issueId,
          })
        }
      />

      <View style={styles.space} />

      <Button
        title="History"
        onPress={() =>
          navigation.navigate("History", {
            issueId,
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
  },

  space: {
    height: 15,
  },
});