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

export default function IssueDetailsScreen({
  route,
  navigation,
}) {
  const { token } = useContext(AuthContext);

  const issueId = route.params?.issueId;

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadIssue();
  }, [issueId]);

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
        "Error",
        error.message || "Unable to load issue."
      );
    } finally {
      setLoading(false);
    }
  };

  const projectUsers = issue?.projectId
    ? [
        ...(issue.projectId.createdBy
          ? [issue.projectId.createdBy]
          : []),
        ...(issue.projectId.members || []),
      ].filter(
        (user, index, self) =>
          user?._id &&
          index ===
            self.findIndex(
              (item) => item._id === user._id
            )
      )
    : [];

  const updateIssue = async (changes) => {
    try {
      setSaving(true);

      const data = await apiRequest(
        `/issues/${issueId}`,
        "PUT",
        changes,
        token
      );

      setIssue(data.issue);
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Unable to update issue."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Issue",
      "Are you sure you want to delete this issue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteIssue,
        },
      ]
    );
  };

  const deleteIssue = async () => {
    try {
      setSaving(true);

      await apiRequest(
        `/issues/${issueId}`,
        "DELETE",
        null,
        token
      );

      Alert.alert(
        "Deleted",
        "Issue deleted successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Unable to delete issue."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#111827"
        />
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          Issue not found.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        {issue.title}
      </Text>

      <Text style={styles.description}>
        {issue.description}
      </Text>

      <Text style={styles.label}>
        Status
      </Text>

      <View style={styles.chipContainer}>
        {statuses.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.chip,
              issue.status === item &&
                styles.selectedChip,
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
                  styles.selectedChipText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>
        Priority
      </Text>

      <View style={styles.chipContainer}>
        {priorities.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.chip,
              issue.priority === item &&
                styles.selectedChip,
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
                  styles.selectedChipText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>
        Assigned User
      </Text>

      <View style={styles.assignedBox}>
        <Pressable
          style={[
            styles.assignedChip,
            !issue.assignedTo &&
              styles.selectedAssignedChip,
          ]}
          onPress={() =>
            updateIssue({
              assignedTo: null,
            })
          }
          disabled={saving}
        >
          <Text
            style={[
              styles.assignedText,
              !issue.assignedTo &&
                styles.selectedAssignedText,
            ]}
          >
            Unassigned
          </Text>
        </Pressable>

        {projectUsers.map((user) => (
          <Pressable
            key={user._id}
            style={[
              styles.assignedChip,
              issue.assignedTo?._id ===
                user._id &&
                styles.selectedAssignedChip,
            ]}
            onPress={() =>
              updateIssue({
                assignedTo: user._id,
              })
            }
            disabled={saving}
          >
            <Text
              style={[
                styles.assignedText,
                issue.assignedTo?._id ===
                  user._id &&
                  styles.selectedAssignedText,
              ]}
            >
              {user.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {issue.screenshots?.length > 0 && (
        <>
          <Text style={styles.label}>
            Screenshots
          </Text>

          <View style={styles.screenshotContainer}>
            {issue.screenshots.map(
              (image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.screenshot}
                />
              )
            )}
          </View>
        </>
      )}

      <View style={styles.actionRow}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate(
              "Comments",
              {
                issueId,
              }
            )
          }
        >
          <Text style={styles.secondaryButtonText}>
            Comments
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate(
              "History",
              {
                issueId,
              }
            )
          }
        >
          <Text style={styles.secondaryButtonText}>
            History
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.deleteButton}
        onPress={handleDelete}
        disabled={saving}
      >
        <Text style={styles.deleteText}>
          Delete Issue
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
    paddingTop: 35,
    paddingBottom: 45,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  description: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 9,
    marginTop: 5,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
    marginBottom: 8,
  },

  selectedChip: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  chipText: {
    color: "#475569",
    fontWeight: "700",
  },

  selectedChipText: {
    color: "#fff",
  },

  assignedBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    marginBottom: 22,
  },

  assignedChip: {
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderRadius: 11,
    marginBottom: 7,
    backgroundColor: "#F8FAFC",
  },

  selectedAssignedChip: {
    backgroundColor: "#111827",
  },

  assignedText: {
    color: "#334155",
    fontWeight: "700",
  },

  selectedAssignedText: {
    color: "#fff",
  },

  screenshotContainer: {
    marginBottom: 22,
  },

  screenshot: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "#E2E8F0",
  },

  actionRow: {
    flexDirection: "row",
    marginBottom: 15,
  },

  secondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  secondaryButtonText: {
    color: "#111827",
    fontWeight: "800",
  },

  deleteButton: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: {
    color: "#DC2626",
    fontWeight: "800",
  },

  errorText: {
    color: "#DC2626",
    fontSize: 15,
  },
});