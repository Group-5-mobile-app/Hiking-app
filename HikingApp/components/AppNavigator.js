import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import SignUpScreen from "../screens/SignUpScreen";
import MapScreen from "../screens/MapScreen";


const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Koti" component={HomeScreen} />
                <Stack.Screen name="Kirjaudu" component={LoginScreen} />
                <Stack.Screen name="Luo tili" component={SignUpScreen} />
                <Stack.Screen name="Kartta" component={MapScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;