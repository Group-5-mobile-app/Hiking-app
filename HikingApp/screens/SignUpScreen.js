import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Button, Text, TextInput, Card, useTheme } from "react-native-paper";
import { registerUser } from "../firebase/auth";
import { getAuth, signOut } from "firebase/auth";

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const theme = useTheme();
  const styles = getStyles(theme);

  const handleSignUp = async () => {
    try {
      const newUser = await registerUser(email, password, confirmPassword);
      const auth = getAuth();
      await signOut(auth);
      Alert.alert("Tili luotu onnistuneesti!", `Tervetuloa ${newUser.email}! \nOle hyvä ja kirjaudu uudelle käyttäjällesi!`);
      navigation.navigate("Kirjaudu");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Luo tili</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Sähköposti</Text>
          <TextInput
            mode="outlined"
            placeholder="Lisää sähköposti"
            value={email}
            onChangeText={setEmail}
            textColor={theme.colors.text}
            style={styles.input}
          />

          <Text style={styles.spacing}>Salasana</Text>
          <TextInput
            mode="outlined"
            placeholder="Lisää salasana"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            textColor={theme.colors.text}
            style={styles.input}
          />

          <Text style={styles.spacing}>Salasana uudelleen</Text>
          <TextInput
            mode="outlined"
            placeholder="Varmista salasana"
            value={confirmPassword}
            secureTextEntry
            onChangeText={setConfirmPassword}
            textColor={theme.colors.text}
            style={styles.input}
          />

          <Button mode="contained" style={styles.button}
           onPress={handleSignUp}
          labelStyle={styles.whiteLabel}
           >
            Luo tili
          </Button>

          <TouchableOpacity onPress={() => navigation.navigate("Kirjaudu")}>
            <Text style={styles.link}>Minulla on jo tili.</Text>
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
    spacing: {
      marginTop: 10,
      marginBottom: 5,
      color: theme.colors.text,
    },
    input: {
      marginBottom: 5,
      backgroundColor: theme.colors.surface,
    },
    button: {
      marginTop: 20,
      backgroundColor: theme.colors.secondary,
    },
    link: {
      textAlign: "center",
      marginTop: 20,
      color: theme.colors.accent,
    },
  });

export default SignUpScreen;