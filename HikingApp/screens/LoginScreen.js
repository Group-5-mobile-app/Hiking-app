import React, { useState } from "react";
import { Alert, View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Button, TextInput, Card, useTheme } from "react-native-paper";
import { loginUser } from "../firebase/auth";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const theme = useTheme();
  const styles = getStyles(theme);

  const handleLogin = async () => {
    try {
      const user = await loginUser(email, password);
      Alert.alert("Kirjautuminen onnistui", `Tervetuloa takaisin, ${user.email}!`);
      navigation.navigate("Koti");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kirjaudu sisään</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Sähköposti</Text>
          <TextInput
            mode="outlined"
            placeholder="Sähköposti"
            value={email}
            onChangeText={setEmail}
            textColor={theme.colors.text}
            style={styles.input}
          />

          <Text style={styles.label}>Salasana</Text>
          <TextInput
            mode="outlined"
            placeholder="Salasana"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            textColor={theme.colors.text}
            style={styles.input}
          />

          <Button
            mode="contained"
            style={styles.button}
            onPress={handleLogin}
            labelStyle={styles.whiteLabel}
          >
            Kirjaudu sisään
          </Button>

          <TouchableOpacity onPress={() => navigation.navigate("Luo")}>
            <Text style={styles.link}>Ei tiliä? Luo tili.</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </View>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 22,
      marginBottom: 20,
      fontWeight: "bold",
      padding: 20,
      textAlign: "center",
      color: theme.colors.text,
    },
    card: {
      padding: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
    },
    label: {
      marginBottom: 5,
      color: theme.colors.text,
    },
    whiteLabel: {
      marginBottom: 5,
      color: theme.colors.white,
    },
    input: {
      marginBottom: 10,
      backgroundColor: theme.colors.surface,
    },
    button: {
      marginTop: 20,
      backgroundColor: theme.colors.secondary,
    },
    buttonLabel: {
      color: theme.colors.text,
    },
    link: {
      textAlign: "center",
      marginTop: 20,
      color: theme.colors.accent,
    },
  });

export default LoginScreen;
