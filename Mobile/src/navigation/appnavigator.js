import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/authcontext";

import LoginScreen from "../screens/loginscreen";
import SignupScreen from "../screens/signupscreen";
import HomeScreen from "../screens/homescreen";
import ProfileScreen from "../screens/profilescreen";
import ProjectsScreen from "../screens/projectsscreen";
import CreateProjectScreen from "../screens/createprojectscreen";
import ProjectDetailsScreen from "../screens/projectdetailsscreen";
import IssuesScreen from "../screens/issuesscreen";
import CreateIssueScreen from "../screens/createissuescreen";
import IssueDetailsScreen from "../screens/issuesdetailscreen";
import CommentsScreen from "../screens/commentsscreen";
import HistoryScreen from "../screens/historyscreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator>
      {!token ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Profile" }}
          />

          <Stack.Screen
            name="Projects"
            component={ProjectsScreen}
            options={{ title: "Projects" }}
          />

          <Stack.Screen
            name="CreateProject"
            component={CreateProjectScreen}
            options={{ title: "Create Project" }}
          />

          <Stack.Screen
            name="ProjectDetails"
            component={ProjectDetailsScreen}
            options={{ title: "Project Details" }}
          />

          <Stack.Screen
            name="Issues"
            component={IssuesScreen}
            options={{ title: "Issues" }}
          />

          <Stack.Screen
            name="CreateIssue"
            component={CreateIssueScreen}
            options={{ title: "Create Issue" }}
          />

          <Stack.Screen
            name="IssueDetails"
            component={IssueDetailsScreen}
            options={{ title: "Issue Details" }}
          />

          <Stack.Screen
            name="Comments"
            component={CommentsScreen}
            options={{ title: "Comments" }}
          />

          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: "History" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;