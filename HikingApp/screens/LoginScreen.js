import React, { useState, useEffect } from "react";
import { Alert, View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Button, TextInput, Card, useTheme } from "react-native-paper";
import { loginUser, authStateListener } from "../firebase/auth";
import { getAuth, signOut } from "firebase/auth";
import { useTranslation } from "react-i18next";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const theme = useTheme();
  const styles = getStyles(theme);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = authStateListener((user) => {
      setLoggedInUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const user = await loginUser(email, password);
      navigation.navigate("Koti");
      setLoggedInUser(user);
      Alert.alert(t("login.login_success"), t("login.welcome_back", { email: user.email }));
    } catch (error) {
      Alert.alert(t("login.error"), error.message);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t("login.logout_confirm"),
      undefined,
      [
        { text: t("login.cancel"), style: "cancel" },
        { text: t("login.logout"), style: "destructive",
          onPress: async () => {
            try {
              const auth = getAuth();
              await signOut(auth);
              setLoggedInUser(null);
              navigation.navigate("Koti");
              Alert.alert(t("login.logout_success"));
            } catch (error) {
              Alert.alert(t("login.error"), error.message);
            }},},]);};

  return (
    <View style={styles.container}>

      {!loggedInUser && ( //Näkyy jos käyttäjä ei ole kirjautunut
      <View>
      <Text style={styles.title}>{t("login.login")}</Text>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>{t("login.email")}</Text>
          <TextInput
            mode="outlined"
            placeholder={t("login.email")}
            value={email}
            onChangeText={setEmail}
            textColor={theme.colors.text}
            style={styles.input}
          />

          <Text style={styles.label}>{t("login.password")}</Text>
          <TextInput
            mode="outlined"
            placeholder={t("login.password")}
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
            {t("login.login")}
          </Button>

          <TouchableOpacity onPress={() => navigation.navigate("Luo")}>
            <Text style={styles.link}>{t("login.no_account")}</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
      </View>
      )}

      {loggedInUser && ( // Näkyy jos käyttäjä on kirjautunut
      <View>
      <Text style={styles.title}>{t("login.logout")}</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>
              {t("login.hi")}, {loggedInUser.email}! {t("login.logout_message")} :)
            </Text>
            <Button
            mode="contained"
            style={styles.button}
            onPress={handleLogout}
            labelStyle={styles.whiteLabel}
          >
            {t("login.logout")}
          </Button>
          </Card.Content>
        </Card>
      </View>
      )}
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
