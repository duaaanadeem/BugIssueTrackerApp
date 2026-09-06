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
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { AuthContext } from "../context/authcontext";

export default function SignupScreen({
  navigation,
}) {
  const { signup } =
    useContext(AuthContext);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSignup = async () => {
    Keyboard.dismiss();

    if (
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      Alert.alert(
        "Missing information",
        "Please complete all fields."
      );
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert(
        "Invalid name",
        "Name must be at least 2 characters."
      );
      return;
    }

    if (!email.includes("@")) {
      Alert.alert(
        "Invalid email",
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak password",
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      await signup(
        name.trim(),
        email.trim(),
        password
      );

      Alert.alert(
        "Account created",
        "Your account has been created successfully.",
        [
          {
            text: "Continue",
            onPress: () =>
              navigation.navigate(
                "Login"
              ),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Signup failed",
        error.message
      );
    } finally {
      setLoading(false);
    }
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
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text style={styles.back}>
              ← Back
            </Text>
          </Pressable>

          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Join your project team and start
            tracking issues.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>
              Full Name
            </Text>

            <TextInput
              placeholder="Your name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              placeholder="At least 6 characters"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />

            <Pressable
              style={[
                styles.button,
                loading &&
                  styles.disabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  Create Account
                </Text>
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={() =>
              navigation.navigate(
                "Login"
              )
            }
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text
                style={styles.loginBold}
              >
                Sign in
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  back: {
    color: "#475569",
    fontWeight: "700",
    marginBottom: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 8,
    marginBottom: 25,
    fontSize: 15,
    lineHeight: 21,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    elevation: 3,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 7,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F8FAFC",
    marginBottom: 18,
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },

  disabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  loginText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 22,
  },

  loginBold: {
    color: "#111827",
    fontWeight: "800",
  },
});