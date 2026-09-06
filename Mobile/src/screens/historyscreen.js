import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import { AuthContext } from "../context/authcontext";
import { apiRequest } from "../services/api";

export default function HistoryScreen({
  route,
}) {
  const { token } = useContext(AuthContext);
  const { issueId } = route.params;

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await apiRequest(
          `/issues/${issueId}/history`,
          "GET",
          null,
          token
        );

        setHistory(data.history || []);
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    };

    loadHistory();
  }, [issueId, token]);

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No history found.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.action}>
              {item.action}
            </Text>

            <Text>
              Old: {item.oldValue || "None"}
            </Text>

            <Text>
              New: {item.newValue || "None"}
            </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  action: {
    fontWeight: "bold",
    fontSize: 17,
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
  },
});