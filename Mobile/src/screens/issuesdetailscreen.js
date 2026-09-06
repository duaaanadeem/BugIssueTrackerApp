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
  Image,
} from "react-native";

import { AuthContext } from "../context/authcontext";

import { apiRequest } from "../services/api";

const statuses = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
];

const priorities = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

export default function IssueDetailsScreen({
  route,
  navigation,
}) {
  const { token } =
    useContext(AuthContext);

  const { issueId } =
    route.params;

  const [issue, setIssue] =
    useState(null);

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const loadIssue = async () => {
    try {
      setLoading(true);

      const data = await apiRequest(
        `/issues/${issueId}`,
        "GET",
        null,
        token
      );

      setIssue(data.issue);
    } catch (error) {
      Alert.alert(
        "Unable to load issue",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

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
      console.log(
        "Unable to load users:",
        error.message
      );
    }
  };

  useEffect(() => {
    loadIssue();
    loadUsers();
  }, [issueId, token]);

  const updateIssue = async (
    changes
  ) => {
    try {
      setSaving(true);

      const data = await apiRequest(
        `/issues/${issueId}`,
        "PUT",
        changes,
        token
      );

      setIssue(data.issue);

      Alert.alert(
        "Updated",
        "Issue updated successfully."
      );
    } catch (error) {
      Alert.alert(
        "Update failed",
        error.message
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111827"
        />

        <Text style={styles.loading}>
          Loading issue...
        </Text>
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          Issue not found.
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
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.issueLabel}>
            ISSUE
          </Text>

          <Text style={styles.created}>
            {issue.createdBy?.name ||
              "Unknown"}
          </Text>
        </View>

        <Text style={styles.title}>
          {issue.title}
        </Text>

        <Text style={styles.description}>
          {issue.description}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Status
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
        >
          {statuses.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.chip,
                issue.status === item &&
                  styles.activeChip,
              ]}
              onPress={() =>
                updateIssue({
                  status: item,
                })
              }
              disabled={saving}
            >
              <Text
                style={[
                  styles.chipText,
                  issue.status === item &&
                    styles.activeChipText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Priority
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
        >
          {priorities.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.chip,
                issue.priority === item &&
                  styles.activeChip,
              ]}
              onPress={() =>
                updateIssue({
                  priority: item,
                })
              }
              disabled={saving}
            >
              <Text
                style={[
                  styles.chipText,
                  issue.priority === item &&
                    styles.activeChipText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Assigned To
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
        >
          <Pressable
            style={[
              styles.chip,
              !issue.assignedTo &&
                styles.activeChip,
            ]}
            onPress={() =>
              updateIssue({
                assignedTo: null,
              })
            }
          >
            <Text
              style={[
                styles.chipText,
                !issue.assignedTo &&
                  styles.activeChipText,
              ]}
            >
              Unassigned
            </Text>
          </Pressable>

          {users.map((user) => (
            <Pressable
              key={user._id}
              style={[
                styles.chip,
                issue.assignedTo?._id ===
                  user._id &&
                  styles.activeChip,
              ]}
              onPress={() =>
                updateIssue({
                  assignedTo: user._id,
                })
              }
            >
              <Text
                style={[
                  styles.chipText,
                  issue.assignedTo?._id ===
                    user._id &&
                    styles.activeChipText,
                ]}
              >
                {user.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {issue.screenshots?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Screenshot
          </Text>

          {issue.screenshots.map(
            (image, index) => (
              <Image
                key={index}
                source={{
                  uri: image,
                }}
                style={styles.screenshot}
              />
            )
          )}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Issue Information
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Project
          </Text>

          <Text style={styles.infoValue}>
            {issue.projectId?.name ||
              "Unknown"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Created By
          </Text>

          <Text style={styles.infoValue}>
            {issue.createdBy?.name ||
              "Unknown"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Assigned To
          </Text>

          <Text style={styles.infoValue}>
            {issue.assignedTo?.name ||
              "Unassigned"}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.actionButton}
        onPress={() =>
          navigation.navigate(
            "Comments",
            {
              issueId,
            }
          )
        }
      >
        <Text style={styles.actionText}>
          View Comments →
        </Text>
      </Pressable>

      <Pressable
        style={styles.actionButton}
        onPress={() =>
          navigation.navigate(
            "History",
            {
              issueId,
            }
          )
        }
      >
        <Text style={styles.actionText}>
          View Issue History →
        </Text>
      </Pressable>

      {saving && (
        <ActivityIndicator
          style={styles.saving}
          color="#111827"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  center: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  loading: {
    color: "#64748B",
    marginTop: 10,
  },

  error: {
    color: "#DC2626",
  },

  headerCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },

  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  issueLabel: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "800",
  },

  created: {
    color: "#94A3B8",
    fontSize: 11,
  },

  title: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 15,
  },

  description: {
    color: "#CBD5E1",
    lineHeight: 21,
    marginTop: 9,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 17,
    padding: 17,
    marginBottom: 12,
    elevation: 2,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
  },

  chip: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 7,
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

  screenshot: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  infoLabel: {
    color: "#64748B",
    fontSize: 13,
  },

  infoValue: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 13,
    maxWidth: "55%",
    textAlign: "right",
  },

  actionButton: {
    height: 52,
    backgroundColor: "#111827",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  actionText: {
    color: "#fff",
    fontWeight: "800",
  },

  saving: {
    marginVertical: 10,
  },
});