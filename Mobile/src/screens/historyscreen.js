import React, {
  useContext,
  useCallback,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthContext } from "../context/authcontext";
import { apiRequest } from "../services/api";

export default function HistoryScreen({ route }) {
  const { token } = useContext(AuthContext);
  const { issueId } = route.params;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await apiRequest(
        `/issues/${issueId}/history`,
        "GET",
        null,
        token
      );

      setHistory(data.history || []);
    } catch (err) {
      setError(err.message || "Failed to load issue history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [issueId, token])
  );

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "Unknown date";
    }

    return value.toLocaleString();
  };

  const getActionColor = (action) => {
    const value = (action || "").toLowerCase();

    if (value.includes("status")) {
      return {
        background: "#EEF2FF",
        text: "#4F46E5",
      };
    }

    if (value.includes("priority")) {
      return {
        background: "#FFF7ED",
        text: "#D97706",
      };
    }

    if (value.includes("assign")) {
      return {
        background: "#ECFDF5",
        text: "#059669",
      };
    }

    if (value.includes("create")) {
      return {
        background: "#EFF6FF",
        text: "#2563EB",
      };
    }

    return {
      background: "#F1F5F9",
      text: "#475569",
    };
  };

  const renderHistory = ({ item, index }) => {
    const actionColor = getActionColor(item.action);

    const actor =
      item.userId?.name ||
      item.createdBy?.name ||
      item.actor?.name ||
      "User";

    return (
      <View style={styles.timelineContainer}>
        <View style={styles.timeline}>
          <View style={styles.dot} />

          {index !== history.length - 1 && (
            <View style={styles.line} />
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.actionBadge,
                {
                  backgroundColor: actionColor.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.actionText,
                  {
                    color: actionColor.text,
                  },
                ]}
              >
                {item.action || "Updated"}
              </Text>
            </View>

            <Text style={styles.date}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

          <Text style={styles.changedBy}>
            Changed by{" "}
            <Text style={styles.actor}>{actor}</Text>
          </Text>

          <View style={styles.valuesContainer}>
            <View style={styles.valueBox}>
              <Text style={styles.valueLabel}>OLD VALUE</Text>

              <Text style={styles.oldValue}>
                {item.oldValue || "None"}
              </Text>
            </View>

            <Text style={styles.arrow}>→</Text>

            <View style={styles.valueBox}>
              <Text style={styles.valueLabel}>NEW VALUE</Text>

              <Text style={styles.newValue}>
                {item.newValue || "None"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#4F46E5"
          />

          <Text style={styles.loadingText}>
            Loading history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && history.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>

          <Text style={styles.errorTitle}>
            Something went wrong
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <Text
            style={styles.retryButton}
            onPress={() => loadHistory()}
          >
            Try Again
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Issue History
            </Text>

            <Text style={styles.subtitle}>
              Track changes made to this issue
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {history.length}
            </Text>
          </View>
        </View>

        {/* History List */}
        <FlatList
          data={history}
          keyExtractor={(item, index) =>
            item._id || index.toString()
          }
          renderItem={renderHistory}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadHistory(true)}
              colors={["#4F46E5"]}
            />
          }
          contentContainerStyle={
            history.length === 0
              ? styles.emptyList
              : styles.list
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  ↺
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No History Yet
              </Text>

              <Text style={styles.emptyText}>
                Changes made to this issue will appear here.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#64748B",
  },

  countBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "800",
  },

  list: {
    paddingBottom: 30,
  },

  timelineContainer: {
    flexDirection: "row",
  },

  timeline: {
    width: 26,
    alignItems: "center",
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4F46E5",
    marginTop: 27,
    zIndex: 2,
  },

  line: {
    position: "absolute",
    top: 38,
    bottom: 0,
    width: 2,
    backgroundColor: "#E2E8F0",
  },

  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginLeft: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  actionBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  actionText: {
    fontSize: 12,
    fontWeight: "800",
  },

  date: {
    flex: 1,
    marginLeft: 10,
    textAlign: "right",
    fontSize: 11,
    color: "#94A3B8",
  },

  changedBy: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
  },

  actor: {
    color: "#0F172A",
    fontWeight: "700",
  },

  valuesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },

  valueBox: {
    flex: 1,
  },

  valueLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    marginBottom: 5,
  },

  oldValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  newValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  arrow: {
    fontSize: 20,
    color: "#94A3B8",
    marginHorizontal: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },

  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  errorIconText: {
    color: "#DC2626",
    fontSize: 28,
    fontWeight: "800",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },

  errorText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: "#4F46E5",
    color: "#FFFFFF",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    overflow: "hidden",
    fontWeight: "700",
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyIconText: {
    fontSize: 32,
    color: "#4F46E5",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },

  emptyText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    lineHeight: 21,
  },
});