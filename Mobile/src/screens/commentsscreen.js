import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import { AuthContext } from "../context/authcontext";
import { apiRequest } from "../services/api";

export default function CommentsScreen({ route }) {
  const { token } = useContext(AuthContext);
  const { issueId } = route.params;

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const loadComments = async () => {
    try {
      const data = await apiRequest(
        `/issues/${issueId}/comments`,
        "GET",
        null,
        token
      );

      setComments(data.comments || []);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    loadComments();
  }, [issueId, token]);

  const addComment = async () => {
    if (!text.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    try {
      await apiRequest(
        "/issues/comments",
        "POST",
        {
          issueId,
          text: text.trim(),
        },
        token
      );

      setText("");
      await loadComments();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Write a comment..."
        value={text}
        onChangeText={setText}
        style={styles.input}
      />

      <Button
        title="Add Comment"
        onPress={addComment}
      />

      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No comments yet.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={styles.user}>
              {item.userId?.name || "User"}
            </Text>

            <Text style={styles.commentText}>
              {item.text}
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

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },

  comment: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  user: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  commentText: {
    fontSize: 15,
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },
});