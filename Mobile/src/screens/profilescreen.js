import React, {
  useContext,
} from "react";

import {
  View,
  Text,
  Button,
  StyleSheet,
} from "react-native";

import { AuthContext } from "../context/authcontext";

export default function ProfileScreen() {
  const { user, logout } =
    useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Profile
      </Text>

      <Text>
        Name: {user?.name || "N/A"}
      </Text>

      <Text>
        Email: {user?.email || "N/A"}
      </Text>

      <Text>
        Role: {user?.role || "N/A"}
      </Text>

      <View style={styles.space} />

      <Button
        title="Logout"
        onPress={logout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  space: {
    height: 20,
  },
});