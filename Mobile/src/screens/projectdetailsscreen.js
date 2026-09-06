import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { AuthContext } from "../context/authcontext";

import { apiRequest } from "../services/api";

export default function ProjectDetailsScreen({
  route,
  navigation,
}) {
  const { token } =
    useContext(AuthContext);

  const { projectId } =
    route.params;

  const [project, setProject] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

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
        "Unable to load project",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId, token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111827"
        />

        <Text style={styles.loading}>
          Loading project...
        </Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          Project could not be found.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>
            {project.name
              ?.charAt(0)
              .toUpperCase() || "P"}
          </Text>
        </View>

        <Text style={styles.title}>
          {project.name}
        </Text>

        <Text style={styles.description}>
          {project.description}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Project Actions
      </Text>

      <Pressable
        style={styles.action}
        onPress={() =>
          navigation.navigate(
            "Issues",
            {
              projectId,
            }
          )
        }
      >
        <View>
          <Text style={styles.actionTitle}>
            View Issues
          </Text>

          <Text style={styles.actionText}>
            Search, filter and manage project
            issues.
          </Text>
        </View>

        <Text style={styles.arrow}>
          →
        </Text>
      </Pressable>

      <Pressable
        style={styles.action}
        onPress={() =>
          navigation.navigate(
            "CreateIssue",
            {
              projectId,
            }
          )
        }
      >
        <View>
          <Text style={styles.actionTitle}>
            Report New Issue
          </Text>

          <Text style={styles.actionText}>
            Create a bug report with priority,
            screenshots and assignment.
          </Text>
        </View>

        <Text style={styles.arrow}>
          +
        </Text>
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
    paddingBottom: 35,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loading: {
    marginTop: 12,
    color: "#64748B",
  },

  error: {
    color: "#DC2626",
  },

  hero: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 24,
    marginBottom: 25,
  },

  icon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  iconText: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827",
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },

  description: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  action: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  actionText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    maxWidth: 280,
  },

  arrow: {
    fontSize: 23,
    color: "#64748B",
  },
});