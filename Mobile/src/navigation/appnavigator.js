import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "../context/authcontext";

import LoginScreen from "../screens/loginscreen";
import SignupScreen from "../screens/signupscreen";
import HomeScreen from "../screens/homescreen";
import ProjectsScreen from "../screens/projectsscreen";
import CreateProjectScreen from "../screens/createprojectscreen";
import ProjectDetailsScreen from "../screens/projectdetailsscreen";
import IssuesScreen from "../screens/issuesscreen";
import CreateIssueScreen from "../screens/createissuescreen";
import IssueDetailsScreen from "../screens/issuesdetailscreen";
import CommentsScreen from "../screens/commentsscreen";
import HistoryScreen from "../screens/historyscreen";
import ProfileScreen from "../screens/profilescreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { token } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {!token ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />

          <Stack.Screen
            name="Signup"
            component={SignupScreen}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />

          <Stack.Screen
            name="Projects"
            component={ProjectsScreen}
          />

          <Stack.Screen
            name="CreateProject"
            component={CreateProjectScreen}
          />

          <Stack.Screen
            name="ProjectDetails"
            component={ProjectDetailsScreen}
          />

          <Stack.Screen
            name="Issues"
            component={IssuesScreen}
          />

          <Stack.Screen
            name="CreateIssue"
            component={CreateIssueScreen}
          />

          <Stack.Screen
            name="IssueDetails"
            component={IssueDetailsScreen}
          />

          <Stack.Screen
            name="Comments"
            component={CommentsScreen}
          />

          <Stack.Screen
            name="History"
            component={HistoryScreen}
          />

          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;