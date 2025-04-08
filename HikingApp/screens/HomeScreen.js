import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Button, ActivityIndicator, Text, Appbar } from "react-native-paper";

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  if (loading) return <ActivityIndicator animating={true} size="large" />;

    return (
        <View style={styles.container}>
          <Appbar.Header style={styles.appbar}>
            <Appbar.Content title="Hiking App" />
            <Appbar.Action
              icon="login"
              onPress={() => navigation.navigate("Kirjaudu")}
            />
          </Appbar.Header>

            <Text variant="headlineMedium" style={styles.title}>Hiking App</Text>
            
            <Button
            mode="contained"
            onPress={() => navigation.navigate("Kartta")}
            style={styles.button}
            >
              Kartta
            </Button>

            <Button
            mode="contained"
            onPress={() => navigation.navigate("Paths")}
            style={styles.button}
            >
              Reitit
            </Button>

            <Button
            mode="contained"
            onPress={() => navigation.navigate("ProfileScreen")}
            style={styles.button}
            >
              Profiili
            </Button>

            <Button
            mode="contained"
            onPress={() => navigation.navigate("SettingScreen")}
            style={styles.button}
            >
              Asetukset
            </Button>

        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: "#616161",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 50,
    color: "#ffffff"
  },
  button: {
    width: "80%",
    marginVertical: 10,
  },
  appbar: {
    width: "100%",
    backgroundColor: "#689f38"
  },
});

export default HomeScreen;