import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, useTheme } from "react-native-paper";

const SettingScreen = ({ isDarkMode, setIsDarkMode }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

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
      transform: [{ translateY: -100 }],
      backgroundColor: theme.colors.primary,
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
