import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import { AuthContext } from "../context/authcontext";
import { apiRequest } from "../services/api";

const statuses = [
  "All",
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
];

const priorities = [
  "All",
  "Low",
  "Medium",
  "High",
  "Critical",
];

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterTitle}>
        {label}
      </Text>

      <Pressable
        style={styles.dropdown}
        onPress={() =>
          setOpen((current) => !current)
        }
      >
        <Text style={styles.dropdownText}>
          {value}
        </Text>

        <Text style={styles.dropdownArrow}>
          {open ? "▲" : "▼"}
        </Text>
      </Pressable>

      {open && (
        <View style={styles.dropdownMenu}>
          {options.map((item) => (
            <Pressable
              key={item.value}
              style={[
                styles.dropdownOption,
                value === item.label &&
                  styles.selectedOption,
              ]}
              onPress={() => {
                onChange(item.value);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === item.label &&
                    styles.selectedOptionText,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function IssuesScreen({
  route,
  navigation,
}) {
  const { token } = useContext(AuthContext);

  const { projectId } = route.params;

  const [project, setProject] =
    useState(null);

  const [issues, setIssues] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [appliedSearch, setAppliedSearch] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const [priority, setPriority] =
    useState("All");

  const [assignedTo, setAssignedTo] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

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
      Alert.alert(
        "Unable to load project",
        error.message
      );
    }
  };

  const loadIssues = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      let endpoint =
        `/issues?projectId=${encodeURIComponent(
          projectId
        )}`;

      // Search is handled by backend.
      if (appliedSearch.trim()) {
        endpoint +=
          `&search=${encodeURIComponent(
            appliedSearch.trim()
          )}`;
      }

      /*
       * We intentionally do NOT send status and
       * priority to the backend here.
       *
       * They are filtered locally below so the
       * mobile filter always matches the UI.
       */

      const data = await apiRequest(
        endpoint,
        "GET",
        null,
        token
      );

      setIssues(data.issues || []);
    } catch (error) {
      Alert.alert(
        "Unable to load issues",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId, token]);

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        "focus",
        () => {
          loadIssues();
        }
      );

    return unsubscribe;
  }, [
    navigation,
    token,
    projectId,
    appliedSearch,
  ]);

  const handleSearch = () => {
    setAppliedSearch(search);
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadIssues(false);

    setRefreshing(false);
  };

  /*
   * Only the project creator and project members
   * can appear in Assigned User.
   */
  const projectUsers = useMemo(() => {
    if (!project) {
      return [];
    }

    return [
      ...(project.createdBy
        ? [project.createdBy]
        : []),

      ...(project.members || []),
    ].filter(
      (user, index, self) =>
        user?._id &&
        index ===
          self.findIndex(
            (item) =>
              item._id === user._id
          )
    );
  }, [project]);

  const assignedOptions = [
    {
      label: "All",
      value: "All",
    },

    {
      label: "Unassigned",
      value: "Unassigned",
    },

    ...projectUsers.map((user) => ({
      label: user.name,
      value: user._id,
    })),
  ];

  /*
   * MAIN FILTERING LOGIC
   *
   * Status
   * Priority
   * Assigned User
   *
   * All filters are applied together.
   */
  const visibleIssues = useMemo(() => {
    return issues.filter((issue) => {
      // STATUS FILTER
      if (
        status !== "All" &&
        issue.status !== status
      ) {
        return false;
      }

      // PRIORITY FILTER
      if (
        priority !== "All" &&
        issue.priority !== priority
      ) {
        return false;
      }

      // ASSIGNED USER FILTER
      if (
        assignedTo === "Unassigned" &&
        issue.assignedTo
      ) {
        return false;
      }

      if (
        assignedTo !== "All" &&
        assignedTo !== "Unassigned" &&
        issue.assignedTo?._id !== assignedTo
      ) {
        return false;
      }

      return true;
    });
  }, [
    issues,
    status,
    priority,
    assignedTo,
  ]);

  const getAssignedLabel = () => {
    if (assignedTo === "All") {
      return "All";
    }

    if (assignedTo === "Unassigned") {
      return "Unassigned";
    }

    const user = projectUsers.find(
      (item) =>
        item._id === assignedTo
    );

    return user?.name || "All";
  };

  const getPriorityStyle = (value) => {
    if (value === "Critical") {
      return styles.critical;
    }

    if (value === "High") {
      return styles.high;
    }

    if (value === "Low") {
      return styles.low;
    }

    return styles.medium;
  };

  const getStatusStyle = (value) => {
    if (value === "Resolved") {
      return styles.resolved;
    }

    if (value === "Closed") {
      return styles.closed;
    }

    if (value === "In Progress") {
      return styles.progress;
    }

    return styles.open;
  };

  const renderIssue = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate(
          "IssueDetails",
          {
            issueId: item._id,
          }
        )
      }
    >
      <View style={styles.cardHeader}>
        <Text
          style={styles.issueTitle}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <Text
          style={[
            styles.priorityBadge,
            getPriorityStyle(
              item.priority
            ),
          ]}
        >
          {item.priority}
        </Text>
      </View>

      <Text
        style={styles.description}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View style={styles.metaRow}>
        <Text
          style={[
            styles.statusBadge,
            getStatusStyle(
              item.status
            ),
          ]}
        >
          {item.status}
        </Text>

        <Text style={styles.assignee}>
          {item.assignedTo?.name ||
            "Unassigned"}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* SEARCH */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search issues..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
          returnKeyType="search"
        />

        <Pressable
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchText}>
            Search
          </Text>
        </Pressable>
      </View>

      {/* FILTERS */}
      <View style={styles.filters}>
        <FilterDropdown
          label="Status"
          value={status}
          options={statuses.map((item) => ({
            label: item,
            value: item,
          }))}
          onChange={setStatus}
        />

        <FilterDropdown
          label="Priority"
          value={priority}
          options={priorities.map((item) => ({
            label: item,
            value: item,
          }))}
          onChange={setPriority}
        />

        <FilterDropdown
          label="Assigned User"
          value={getAssignedLabel()}
          options={assignedOptions}
          onChange={setAssignedTo}
        />
      </View>

      {/* HEADER */}
      <View style={styles.resultHeader}>
        <View>
          <Text style={styles.resultTitle}>
            Issues
          </Text>

          {project?.name && (
            <Text
              style={styles.projectName}
            >
              {project.name}
            </Text>
          )}
        </View>

        <Pressable
          style={styles.createButton}
          onPress={() =>
            navigation.navigate(
              "CreateIssue",
              {
                projectId,
              }
            )
          }
        >
          <Text style={styles.createText}>
            + Report
          </Text>
        </Pressable>
      </View>

      {/* ISSUES */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator
            size="large"
            color="#111827"
          />

          <Text
            style={styles.loadingText}
          >
            Loading issues...
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleIssues}
          keyExtractor={(item) =>
            item._id
          }
          renderItem={renderIssue}
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={
            visibleIssues.length === 0
              ? styles.emptyContainer
              : styles.list
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text
                style={styles.emptyIcon}
              >
                ✓
              </Text>

              <Text
                style={styles.emptyTitle}
              >
                No issues found
              </Text>

              <Text
                style={styles.emptyText}
              >
                Try changing your search or
                filters, or report a new issue.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },

  searchRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#0F172A",
  },

  searchButton: {
    backgroundColor: "#111827",
    marginLeft: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    justifyContent: "center",
  },

  searchText: {
    color: "#fff",
    fontWeight: "700",
  },

  filters: {
    marginBottom: 4,
    zIndex: 10,
  },

  filterGroup: {
    marginBottom: 10,
  },

  filterTitle: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
  },

  dropdown: {
    height: 46,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
  },

  dropdownArrow: {
    color: "#64748B",
    fontSize: 11,
  },

  dropdownMenu: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginTop: 5,
    overflow: "hidden",
    elevation: 4,
  },

  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  selectedOption: {
    backgroundColor: "#111827",
  },

  dropdownOptionText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
  },

  selectedOptionText: {
    color: "#fff",
    fontWeight: "800",
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
    zIndex: 1,
  },

  resultTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
  },

  projectName: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },

  createButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
  },

  createText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  list: {
    paddingBottom: 25,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 17,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  issueTitle: {
    flex: 1,
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginRight: 10,
  },

  priorityBadge: {
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
  },

  critical: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
  },

  high: {
    backgroundColor: "#FFEDD5",
    color: "#C2410C",
  },

  medium: {
    backgroundColor: "#FEF3C7",
    color: "#A16207",
  },

  low: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
  },

  description: {
    color: "#64748B",
    lineHeight: 20,
    marginTop: 9,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  statusBadge: {
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },

  open: {
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
  },

  progress: {
    backgroundColor: "#E0E7FF",
    color: "#4338CA",
  },

  resolved: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
  },

  closed: {
    backgroundColor: "#E2E8F0",
    color: "#475569",
  },

  assignee: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },

  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#64748B",
    marginTop: 10,
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
    fontSize: 23,
    fontWeight: "800",
    color: "#475569",
    marginBottom: 15,
  },

  emptyTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },

  emptyText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 7,
    lineHeight: 20,
  },
});