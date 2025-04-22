import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Button, ActivityIndicator, Text, Appbar, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const styles = getStyles(theme);
  const { t } = useTranslation();

  if (loading) return <ActivityIndicator animating={true} size="large" />;

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title={t("app_title")} titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="login" onPress={() => navigation.navigate("Kirjaudu")} />
      </Appbar.Header>

      <Text variant="headlineMedium" style={styles.title}>{t("app_title")}</Text>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("Kartta")}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        {t("home.map")}
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("Paths")}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        {t("home.paths")}
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("ProfileScreen")}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        {t("home.profile")}
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("SettingScreen")}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        {t("home.settings")}
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
      backgroundColor: theme.colors.primary,
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
