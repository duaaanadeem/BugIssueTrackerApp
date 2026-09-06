import React, {
  useContext,
  useEffect,
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
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";

import { AuthContext } from "../context/authcontext";

import { apiRequest } from "../services/api";

export default function CommentsScreen({
  route,
}) {
  const { token, user } =
    useContext(AuthContext);

  const { issueId } =
    route.params;

  const [comments, setComments] =
    useState([]);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const loadComments = async () => {
    try {
      setLoading(true);

      const data = await apiRequest(
        `/issues/${issueId}/comments`,
        "GET",
        null,
        token
      );

      setComments(
        data.comments || []
      );
    } catch (error) {
      Alert.alert(
        "Unable to load comments",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [issueId, token]);

  const addComment = async () => {
    Keyboard.dismiss();

    if (!text.trim()) {
      Alert.alert(
        "Empty comment",
        "Please write a comment first."
      );
      return;
    }

    try {
      setSending(true);

      const data = await apiRequest(
        "/issues/comments",
        "POST",
        {
          issueId,
          text: text.trim(),
        },
        token
      );

      setComments((previous) => [
        ...previous,
        data.comment,
      ]);

      setText("");
    } catch (error) {
      Alert.alert(
        "Unable to add comment",
        error.message
      );
    } finally {
      setSending(false);
    }
  };

  const renderComment = ({
    item,
  }) => {
    const isMine =
      item.userId?._id ===
      user?.id;

    return (
      <View
        style={[
          styles.comment,
          isMine &&
            styles.myComment,
        ]}
      >
        <View style={styles.commentHeader}>
          <Text style={styles.user}>
            {item.userId?.name ||
              "User"}
          </Text>

          <Text style={styles.time}>
            {item.createdAt
              ? new Date(
                  item.createdAt
                ).toLocaleDateString()
              : ""}
          </Text>
        </View>

        <Text style={styles.commentText}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color="#111827"
            />

            <Text style={styles.loading}>
              Loading comments...
            </Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) =>
              item._id
            }
            renderItem={renderComment}
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              comments.length === 0
                ? styles.emptyContainer
                : styles.list
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text
                  style={styles.emptyIcon}
                >
                  C
                </Text>

                <Text
                  style={styles.emptyTitle}
                >
                  No comments yet
                </Text>

                <Text
                  style={styles.emptyText}
                >
                  Start the conversation about
                  this issue.
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.composer}>
          <TextInput
            placeholder="Write a comment..."
            placeholderTextColor="#94A3B8"
            value={text}
            onChangeText={setText}
            style={styles.input}
            multiline
          />

          <Pressable
            style={[
              styles.send,
              sending &&
                styles.disabled,
            ]}
            onPress={addComment}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator
                color="#fff"
                size="small"
              />
            ) : (
              <Text style={styles.sendText}>
                Send
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loading: {
    color: "#64748B",
    marginTop: 10,
  },

  list: {
    padding: 16,
    paddingBottom: 15,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  empty: {
    alignItems: "center",
    padding: 30,
  },

  emptyIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "800",
    fontSize: 20,
    color: "#475569",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    color: "#64748B",
    marginTop: 5,
    textAlign: "center",
  },

  comment: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },

  myComment: {
    borderLeftWidth: 3,
    borderLeftColor: "#111827",
  },

  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  user: {
    color: "#0F172A",
    fontWeight: "800",
  },

  time: {
    color: "#94A3B8",
    fontSize: 10,
  },

  commentText: {
    color: "#475569",
    lineHeight: 20,
  },

  composer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 45,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: "#0F172A",
  },

  send: {
    backgroundColor: "#111827",
    height: 45,
    paddingHorizontal: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  disabled: {
    opacity: 0.6,
  },

  sendText: {
    color: "#fff",
    fontWeight: "800",
  },
});