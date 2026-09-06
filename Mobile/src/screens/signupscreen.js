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

export default function SignupScreen({ navigation }) {
  const { signup } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    Keyboard.dismiss();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Required fields
    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert(
        "Missing information",
        "Please complete all fields."
      );
      return;
    }

    // Name validation
    if (trimmedName.length < 2) {
      Alert.alert(
        "Invalid name",
        "Name must be at least 2 characters."
      );
      return;
    }

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert(
        "Invalid email",
        "Please enter a valid email address."
      );
      return;
    }

    // Password validation
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
        trimmedName,
        trimmedEmail,
        password
      );

      Alert.alert(
        "Account Created",
        "Your account has been created successfully.",
        [
          {
            text: "Continue",
            onPress: () =>
              navigation.navigate("Login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Signup Failed",
        error.message || "Unable to create your account."
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
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <Pressable
            onPress={() =>
              navigation.navigate("Login")
            }
            style={styles.backButton}
          >
            <Text style={styles.back}>
              ← Back to Login
            </Text>
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>
                B
              </Text>
            </View>

            <Text style={styles.title}>
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Join your project team and start
              tracking issues.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Name */}
            <Text style={styles.label}>
              Full Name
            </Text>

            <TextInput
              placeholder="Your name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoCapitalize="words"
              editable={!loading}
            />

            {/* Email */}
            <Text style={styles.label}>
              Email Address
            </Text>

            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading}
            />

            {/* Password */}
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
              autoCapitalize="none"
              editable={!loading}
            />

            {/* Signup Button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                loading && styles.disabled,
                pressed && !loading && styles.pressed,
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />

                  <Text style={styles.loadingText}>
                    Creating Account...
                  </Text>
                </>
              ) : (
                <Text style={styles.buttonText}>
                  Create Account
                </Text>
              )}
            </Pressable>
          </View>

          {/* Login Link */}
          <Pressable
            onPress={() =>
              navigation.navigate("Login")
            }
            disabled={loading}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginBold}>
                Sign in
              </Text>
            </Text>
          </Pressable>

          {/* Footer */}
          <Text style={styles.footer}>
            Bug & Issue Tracker
          </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 30,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 25,
  },

  back: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },

  header: {
    marginBottom: 25,
  },

  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 330,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
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
    color: "#0F172A",
    fontSize: 15,
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 4,
  },

  pressed: {
    opacity: 0.85,
  },

  disabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  loadingText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 10,
  },

  loginText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 22,
    fontSize: 14,
  },

  loginBold: {
    color: "#4F46E5",
    fontWeight: "800",
  },

  footer: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 28,
  },
});