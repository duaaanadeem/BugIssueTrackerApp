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
  FlatList,
  RefreshControl,
} from "react-native";

import { AuthContext } from "../context/authcontext";

import { apiRequest } from "../services/api";

export default function ProjectsScreen({
  navigation,
}) {
  const { token } =
    useContext(AuthContext);

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadProjects = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const data = await apiRequest(
        "/projects",
        "GET",
        null,
        token
      );

      setProjects(data.projects || []);
    } catch (error) {
      Alert.alert(
        "Unable to load projects",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        "focus",
        () => loadProjects()
      );

    return unsubscribe;
  }, [navigation, token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects(false);
    setRefreshing(false);
  };

  const renderProject = ({
    item,
  }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate(
          "ProjectDetails",
          {
            projectId: item._id,
          }
        )
      }
    >
      <View style={styles.cardTop}>
        <View style={styles.projectIcon}>
          <Text
            style={styles.projectIconText}
          >
            {item.name
              ?.charAt(0)
              .toUpperCase() || "P"}
          </Text>
        </View>

        <View style={styles.arrowCircle}>
          <Text style={styles.arrow}>
            →
          </Text>
        </View>
      </View>

      <Text style={styles.name}>
        {item.name}
      </Text>

      <Text
        style={styles.description}
        numberOfLines={2}
      >
        {item.description ||
          "No description available"}
      </Text>

      <Text style={styles.created}>
        Created by{" "}
        {item.createdBy?.name ||
          "Unknown user"}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>
            Your Projects
          </Text>

          <Text style={styles.subheading}>
            {projects.length} project
            {projects.length === 1
              ? ""
              : "s"} available
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            navigation.navigate(
              "CreateProject"
            )
          }
        >
          <Text style={styles.addText}>
            + New
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) =>
          item._id
        }
        renderItem={renderProject}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={
          projects.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        ListEmptyComponent={
          loading ? (
            <Text style={styles.empty}>
              Loading projects...
            </Text>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>
                P
              </Text>

              <Text style={styles.emptyTitle}>
                No projects yet
              </Text>

              <Text style={styles.emptyText}>
                Create your first project to
                start tracking issues.
              </Text>

              <Pressable
                style={styles.emptyButton}
                onPress={() =>
                  navigation.navigate(
                    "CreateProject"
                  )
                }
              >
                <Text
                  style={
                    styles.emptyButtonText
                  }
                >
                  Create Project
                </Text>
              </Pressable>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: "#0F172A",
  },

  subheading: {
    color: "#64748B",
    marginTop: 4,
  },

  addButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },

  addText: {
    color: "#fff",
    fontWeight: "800",
  },

  list: {
    paddingBottom: 25,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 13,
    elevation: 2,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  projectIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  projectIconText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  arrowCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  arrow: {
    fontSize: 19,
    color: "#64748B",
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  description: {
    color: "#64748B",
    marginTop: 7,
    lineHeight: 20,
  },

  created: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 12,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyBox: {
    alignItems: "center",
    padding: 25,
  },

  emptyIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#475569",
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 6,
    lineHeight: 20,
  },

  emptyButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },

  emptyButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  empty: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 30,
  },
});