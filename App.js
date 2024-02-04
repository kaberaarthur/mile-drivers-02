import { StatusBar } from "expo-status-bar";
import { Text, View, KeyboardAvoidingView, Platform } from "react-native";
import { Provider } from "react-redux";
import { store } from "./store";

import HomeScreen from "./screens/HomeScreen";
import SignUpScreen from "./screens/SignUpScreen";
import UpdateProfileScreen from "./screens/UpdateProfileScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import ConfirmCodeScreen from "./screens/ConfirmCodeScreen";
import MenuScreen from "./screens/MenuScreen";

import RequestsScreen from "./screens/RequestsScreen";
import OneRequestScreen from "./screens/OneRequestScreen";
import ChatScreen from "./screens/ChatScreen";
import PickUpScreen from "./screens/PickUpScreen";
import RideInProgressScreen from "./screens/RideInProgressScreen";

import FinanceScreen from "./screens/FinanceScreen";

import HistoryScreen from "./screens/HistoryScreen";
import NotificationScreen from "./screens/NotificationScreen";

import VehicleManagementScreen from "./screens/VehicleManagementScreen";
import AddVehicleScreen from "./screens/AddVehicleScreen";
import AddVehicleDocumentsScreen from "./screens/AddVehicleDocumentsScreen";

import DocumentManagementScreen from "./screens/DocumentManagementScreen";
import DrivingLicenseScreen from "./screens/DrivingLicenseScreen";
import InsuranceStickerScreen from "./screens/InsuranceStickerScreen";
import IDCardScreen from "./screens/IDCardScreen";

import TestScreen from "./screens/TestScreen";

import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 1) Setup Redux - Complete

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <Provider store={store}>
      <NavigationContainer>
        <SafeAreaProvider>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? -64 : 0}
          >
            <Stack.Navigator>
              <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="SignUpScreen"
                component={SignUpScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="TestScreen"
                component={TestScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="UpdateProfileScreen"
                component={UpdateProfileScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="EditProfileScreen"
                component={EditProfileScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="ConfirmCodeScreen"
                component={ConfirmCodeScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="MenuScreen"
                component={MenuScreen}
                options={{
                  headerShown: false,
                }}
              />

              <Stack.Screen
                name="RequestsScreen"
                component={RequestsScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="OneRequestScreen"
                component={OneRequestScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="ChatScreen"
                component={ChatScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="PickUpScreen"
                component={PickUpScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="RideInProgressScreen"
                component={RideInProgressScreen}
                options={{
                  headerShown: false,
                }}
              />

              <Stack.Screen
                name="FinanceScreen"
                component={FinanceScreen}
                options={{
                  headerShown: false,
                }}
              />

              <Stack.Screen
                name="HistoryScreen"
                component={HistoryScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="NotificationScreen"
                component={NotificationScreen}
                options={{
                  headerShown: false,
                }}
              />

              <Stack.Screen
                name="VehicleManagementScreen"
                component={VehicleManagementScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="AddVehicleScreen"
                component={AddVehicleScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="AddVehicleDocumentsScreen"
                component={AddVehicleDocumentsScreen}
                options={{
                  headerShown: false,
                }}
              />

              <Stack.Screen
                name="DocumentManagementScreen"
                component={DocumentManagementScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="DrivingLicenseScreen"
                component={DrivingLicenseScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="InsuranceStickerScreen"
                component={InsuranceStickerScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="IDCardScreen"
                component={IDCardScreen}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          </KeyboardAvoidingView>
        </SafeAreaProvider>
      </NavigationContainer>
    </Provider>
  );
}
