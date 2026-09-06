import React from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import { AuthProvider } from "./src/context/authcontext";

import AppNavigator from "./src/navigation/appnavigator";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}