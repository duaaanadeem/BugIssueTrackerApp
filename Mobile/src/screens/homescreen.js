import React, { useContext } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
} from "react-native";

import { AuthContext } from "../context/authcontext";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome, {user?.name || "User"}
      </Text>

      <Button
        title="Projects"
        onPress={() => navigation.navigate("Projects")}
      />

      <View style={styles.space} />

      <Button
        title="Profile"
        onPress={() => navigation.navigate("Profile")}
      />

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
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },

  space: {
    height: 15,
  },
});