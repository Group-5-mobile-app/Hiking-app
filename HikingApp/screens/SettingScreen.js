import React from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text, Card, Button, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import deleteUser from "../components/deleteUser";
import { auth } from "../firebase/firebaseConfig";

const SettingScreen = ({ isDarkMode, setIsDarkMode }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();

  const confirmDelete = () => {
    Alert.alert(
      "Vahvista poisto",
      "Oletko varma, että haluat poistaa käyttäjätilisi? Tätä ei voi perua.",
      [
        { text: "Peruuta", style: "cancel" },
        { text: "Kyllä, poista käyttäjä", style: "destructive",
          onPress: async () => {
            try {
              await deleteUser();
              Alert.alert("Käyttäjä poistettu");
              navigation.navigate("Koti");
            } catch (error) {
              console.error("Virhe poistettaessa:", error);
              Alert.alert("Virhe", error.message);
            }
          }}]);};

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Asetukset</Text>
          <Text style={styles.label}>Vaihda sovelluksen teema</Text>

          <TouchableOpacity
            style={isDarkMode ? styles.buttonDark : styles.buttonLight}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={styles.buttonText}>
              {isDarkMode ? "Tumma teema" : "Vaalea teema"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Kieliasetukset</Text>

          <View style={styles.languageContainer}>
            <TouchableOpacity style={styles.languageButton}>
              <Text style={styles.languageText}>Suomi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.languageButton}>
              <Text style={styles.languageText}>Englanti</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
            <Text style={styles.title}>Poista käyttäjä</Text>
            <Button 
                mode="contained" 
                style={styles.deleteButton}
                labelStyle={{color: "white" }}
                onPress={confirmDelete}
                disabled={!auth.currentUser}>
                Poista käyttäjä
            </Button>
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
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    card: {
      width: "80%",
      padding: 20,
      backgroundColor: theme.colors.primary,
      marginBottom: 30,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      color: theme.colors.text,
    },
    label: {
      fontSize: 18,
      marginBottom: 5,
      color: theme.colors.text,
    },
    buttonLight: {
      padding: 10,
      marginVertical: 5,
      borderRadius: 5,
      alignItems: "center",
      backgroundColor: theme.colors.surface,
    },
    buttonDark: {
      padding: 10,
      marginVertical: 5,
      borderRadius: 5,
      alignItems: "center",
      backgroundColor: theme.colors.secondary,
    },
    deleteButton: {
      padding: 10,
      marginVertical: 5,
      borderRadius: 5,
      alignItems: "center",
      backgroundColor: theme.colors.cancelButton,
    },
    buttonText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    languageContainer: {
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
    },
    languageButton: {
      padding: 10,
      marginVertical: 5,
      borderRadius: 5,
      alignItems: "center",
      backgroundColor: theme.colors.secondary,
    },
    languageText: {
      fontSize: 16,
      color: theme.colors.white,
    },
  });

export default SettingScreen;
