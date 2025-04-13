import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Button, ActivityIndicator, Text, Appbar, useTheme } from "react-native-paper";

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const styles = getStyles(theme);

  if (loading) return <ActivityIndicator animating={true} size="large" />;

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Hiking App" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="login" onPress={() => navigation.navigate("Kirjaudu")} />
      </Appbar.Header>

      <Text variant="headlineMedium" style={styles.title}>Hiking App</Text>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("Kartta")}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Kartta
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("Paths")}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Reitit
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("ProfileScreen")}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Profiili
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("SettingScreen")}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Asetukset
      </Button>
    </View>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    appbar: {
      width: "100%",
      backgroundColor: theme.colors.surface,
    },
    appbarTitle: {
      color: theme.colors.text,
    },
    title: {
      fontWeight: "bold",
      marginBottom: 20,
      marginTop: 50,
      color: theme.colors.text,
    },
    button: {
      width: "80%",
      marginVertical: 10,
      backgroundColor: theme.colors.primary,
    },
    buttonLabel: {
      color: theme.colors.text,
    },
  });

export default HomeScreen;
