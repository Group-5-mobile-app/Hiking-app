import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import SignUpScreen from "../screens/SignUpScreen";
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingScreen from "../screens/SettingScreen";
import PathScreen from "../screens/PathScreen";
import PathDetailScreen from "../screens/PathDetailScreen";
import { useTranslation } from 'react-i18next';
import RouteTracker from "./RouteTracker";
import RouteDetails from "../screens/RouteDetails";

const Stack = createStackNavigator();

const AppNavigator = ({ isDarkMode, setIsDarkMode }) => {
    const { t } = useTranslation();
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Koti" options={{ title: t("nav.home") }} component={HomeScreen} />
                <Stack.Screen name="Kartta" options={{ title: t("nav.map") }} component={MapScreen} />
                <Stack.Screen name="Kirjaudu" options={{ title: t("nav.login") }} component={LoginScreen} />
                <Stack.Screen name="Luo" options={{ title: t("nav.signup") }} component={SignUpScreen} />
                <Stack.Screen name="ProfileScreen" options={{ title: t("nav.profile") }} component={ProfileScreen} />
                <Stack.Screen name="SettingScreen" options={{ title: t("nav.setting") }} >
                    {(props) => (
                        <SettingScreen
                            {...props}
                            isDarkMode={isDarkMode}
                            setIsDarkMode={setIsDarkMode}
                        />
                    )}
                </Stack.Screen>
                <Stack.Screen name="Paths" options={{ title: t("nav.paths") }} component={PathScreen} /> 
                <Stack.Screen name="PathDetail" options={{ title: t("nav.pathDetail") }} component={PathDetailScreen} />
                <Stack.Screen name="Tracker" options={{ title: t("nav.tracker") }} component={RouteTracker} /> 
                <Stack.Screen name="RouteDetails" component={RouteDetails} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;