import React, {
  useContext,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { AuthContext } from "../context/authcontext";
import { apiRequest } from "../services/api";

export default function CreateProjectScreen({ navigation }) {
  const { token } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [members, setMembers] = useState([]);

  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const searchUsers = async () => {
    const value = searchName.trim();

    if (!value) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);

      const data = await apiRequest(
        `/auth/users/search?name=${encodeURIComponent(value)}`,
        "GET",
        null,
        token
      );

      setSearchResults(data.users || []);
    } catch (error) {
      Alert.alert(
        "Search failed",
        error.message || "Unable to search users."
      );
    } finally {
      setSearching(false);
    }
  };

  const addMember = (user) => {
    const alreadyAdded = members.some(
      (member) => member._id === user._id
    );

    if (alreadyAdded) {
      return;
    }

    setMembers((current) => [...current, user]);

    setSearchResults((current) =>
      current.filter(
        (item) => item._id !== user._id
      )
    );
  };

  const removeMember = (userId) => {
    setMembers((current) =>
      current.filter(
        (member) => member._id !== userId
      )
    );
  };

  const createProject = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Validation",
        "Please enter a project name."
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        "Validation",
        "Please enter a project description."
      );
      return;
    }

    try {
      setCreating(true);

      const data = await apiRequest(
        "/projects",
        "POST",
        {
          name: name.trim(),
          description: description.trim(),
          members: members.map(
            (member) => member._id
          ),
        },
        token
      );

      Alert.alert(
        "Success",
        "Project created successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.replace("ProjectDetails", {
                projectId: data.project._id,
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Unable to create project."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Create Project
      </Text>

      <Text style={styles.label}>
        Project Name
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter project name"
        placeholderTextColor="#94A3B8"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}
        placeholder="Enter project description"
        placeholderTextColor="#94A3B8"
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.sectionTitle}>
        Add Members
      </Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search user by name"
          placeholderTextColor="#94A3B8"
          value={searchName}
          onChangeText={setSearchName}
          onSubmitEditing={searchUsers}
          returnKeyType="search"
        />

        <Pressable
          style={styles.searchButton}
          onPress={searchUsers}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>
              Search
            </Text>
          )}
        </Pressable>
      </View>

      {searchResults.length > 0 && (
        <View style={styles.resultsBox}>
          {searchResults.map((user) => (
            <View
              key={user._id}
              style={styles.resultRow}
            >
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user.name}
                </Text>

                <Text style={styles.userEmail}>
                  {user.email}
                </Text>
              </View>

              <Pressable
                style={styles.addButton}
                onPress={() => addMember(user)}
              >
                <Text style={styles.addButtonText}>
                  Add
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>
        Selected Members
      </Text>

      {members.length === 0 ? (
        <Text style={styles.emptyText}>
          No members added yet.
        </Text>
      ) : (
        <View style={styles.membersBox}>
          {members.map((member) => (
            <View
              key={member._id}
              style={styles.memberRow}
            >
              <View>
                <Text style={styles.memberName}>
                  {member.name}
                </Text>

                <Text style={styles.memberEmail}>
                  {member.email}
                </Text>
              </View>

              <Pressable
                style={styles.removeButton}
                onPress={() =>
                  removeMember(member._id)
                }
              >
                <Text style={styles.removeText}>
                  ×
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable
        style={[
          styles.createButton,
          creating && styles.disabledButton,
        ]}
        onPress={createProject}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>
            Create Project
          </Text>
        )}
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

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 7,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    color: "#0F172A",
    fontSize: 15,
    marginBottom: 18,
  },

  textArea: {
    height: 110,
    paddingTop: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 5,
    marginBottom: 12,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    color: "#0F172A",
    marginRight: 8,
  },

  searchButton: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  searchButtonText: {
    color: "#fff",
    fontWeight: "800",
  },

  resultsBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  userEmail: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  addButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "800",
  },

  membersBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },

  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  memberName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  memberEmail: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },

  removeText: {
    color: "#DC2626",
    fontSize: 24,
    lineHeight: 26,
    fontWeight: "600",
  },

  emptyText: {
    color: "#64748B",
    fontSize: 14,
    marginBottom: 20,
  },

  createButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  disabledButton: {
    opacity: 0.7,
  },

  createButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});