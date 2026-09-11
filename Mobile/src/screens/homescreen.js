import React, {
  useCallback,
  useContext,
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
  RefreshControl,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "../context/authcontext";
import { apiRequest } from "../services/api";

export default function HomeScreen({ navigation }) {
  const { user, token, logout } = useContext(AuthContext);

  const [projectCount, setProjectCount] = useState(null);
  const [openIssueCount, setOpenIssueCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadSummary = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const projectsData = await apiRequest(
        "/projects",
        "GET",
        null,
        token
      );

      const projects = projectsData.projects || [];
      setProjectCount(projects.length);

      const issuesData = await apiRequest(
        "/issues?status=Open",
        "GET",
        null,
        token
      );

      setOpenIssueCount(
        (issuesData.issues || []).length
      );
    } catch (err) {
      setError(
        err.message || "Unable to load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [token])
  );

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadSummary(false);

    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Welcome back,
          </Text>

          <Text style={styles.name}>
            {user?.name || "there"}
          </Text>
        </View>

        <Pressable
          style={styles.avatar}
          onPress={() =>
            navigation.navigate("Profile")
          }
        >
          <Text style={styles.avatarText}>
            {(user?.name || "U")
              .charAt(0)
              .toUpperCase()}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.statsLoading}>
          <ActivityIndicator
            size="small"
            color="#111827"
          />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {projectCount ?? "-"}
            </Text>

            <Text style={styles.statLabel}>
              Projects
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {openIssueCount ?? "-"}
            </Text>

            <Text style={styles.statLabel}>
              Open Issues
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <Pressable
        style={styles.action}
        onPress={() =>
          navigation.navigate("Projects")
        }
      >
        <View>
          <Text style={styles.actionTitle}>
            My Projects
          </Text>

          <Text style={styles.actionText}>
            View, create and manage your projects.
          </Text>
        </View>

        <Text style={styles.arrow}>→</Text>
      </Pressable>

      <Pressable
        style={styles.action}
        onPress={() =>
          navigation.navigate("CreateProject")
        }
      >
        <View>
          <Text style={styles.actionTitle}>
            New Project
          </Text>

          <Text style={styles.actionText}>
            Start tracking issues on a new project.
          </Text>
        </View>

        <Text style={styles.arrow}>+</Text>
      </Pressable>

      <Pressable
        style={styles.action}
        onPress={() =>
          navigation.navigate("Profile")
        }
      >
        <View>
          <Text style={styles.actionTitle}>
            My Profile
          </Text>

          <Text style={styles.actionText}>
            View your account details.
          </Text>
        </View>

        <Text style={styles.arrow}>→</Text>
      </Pressable>

      <Pressable
        style={styles.logout}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Logout
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
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  greeting: {
    color: "#64748B",
    fontSize: 14,
  },

  name: {
    color: "#0F172A",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },

  statsLoading: {
    paddingVertical: 20,
    alignItems: "center",
  },

  errorText: {
    color: "#DC2626",
    marginBottom: 15,
  },

  statsRow: {
    flexDirection: "row",
    marginBottom: 25,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    marginRight: 10,
  },

  statValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },

  statLabel: {
    color: "#CBD5E1",
    fontSize: 13,
    marginTop: 4,
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
    maxWidth: 260,
  },

  arrow: {
    fontSize: 23,
    color: "#64748B",
  },

  logout: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "800",
  },
});