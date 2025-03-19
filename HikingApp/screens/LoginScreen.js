import React, { useState } from "react";
import { Alert, TextInput, View, Button, StyleSheet, Text } from "react-native";
import { loginUser } from "../firebase/auth";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const user = await loginUser(email, password);
            Alert.alert("Success", `Welcome back, ${user.email}!`);
            navigation.navigate("HomeScreen");
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={styles.view}>
            <Text style={styles.text}>Login</Text>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} /> 
            <Button title="Login" onPress={handleLogin} />
            <Button title="Sign Up" onPress={() => navigation.navigate("SignUpScreen")} /> 
        </View>
    );
};

const styles = StyleSheet.create({
  view: {
    padding: 20,
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 10,
  },
});

export default LoginScreen;