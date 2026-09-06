import React, {
  useContext,
} from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";

import { AuthContext } from "../context/authcontext";

export default function ProfileScreen() {
  const { user, logout } =
    useContext(AuthContext);

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
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name || "U")
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>
          {user?.name || "N/A"}
        </Text>

        <Text style={styles.role}>
          {user?.role || "user"}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.row}>
          <Text style={styles.label}>
            Name
          </Text>

          <Text style={styles.value}>
            {user?.name || "N/A"}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>
            Email
          </Text>

          <Text style={styles.value}>
            {user?.email || "N/A"}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>
            Role
          </Text>

          <Text style={styles.value}>
            {user?.role || "N/A"}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.logout}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  profileCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  avatarText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },

  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  role: {
    color: "#CBD5E1",
    marginTop: 5,
    textTransform: "capitalize",
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginTop: 16,
  },

  row: {
    paddingVertical: 7,
  },

  label: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },

  value: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
  },

  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  logout: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "800",
  },
});