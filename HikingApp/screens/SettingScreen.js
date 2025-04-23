import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from "react-native";
import { Text, Card, Button, useTheme, Dialog, Portal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import deleteUser from "../components/deleteUser";
import { auth } from "../firebase/firebaseConfig";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingScreen = ({ isDarkMode, setIsDarkMode }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { i18n, t } = useTranslation();
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showReauthDialog, setShowReauthDialog] = useState(false);

  const handleLanguageChange = async (lang) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === email) {
      Alert.alert(t("error"), t("settings.invalid_email"));
      return;
    }
    setShowReauthDialog(true);
  };
  const cancelReauthentication = () => {
    setPassword("");
    setShowReauthDialog(false);
  };
  const reauthenticateAndUpdateEmail = async () => {
    if (!password) {
        Alert.alert(t("error"), t("settings.enter_password"));
        return;
    }
    try {
        const user = auth.currentUser;
        if (!user) throw new Error(t("settings.user_not_found"));

        const credential = EmailAuthProvider.credential(
            user.email,
            password
        );

        await reauthenticateWithCredential(user, credential);
        await verifyBeforeUpdateEmail(user, newEmail);
        
        setPassword("");
        setNewEmail("");
        setShowReauthDialog(false);
        
        Alert.alert(
            t("settings.verification_link_sent"), 
            t("settings.verification_link_sent_message")
        );
        
    } catch (error) {
        console.error("Error updating email:", error);
        Alert.alert(t("error"), error.message);
        setPassword("");
    }
};

  const confirmDelete = () => {
    Alert.alert(
      t("settings.confirm_delete"),
      t("settings.confirm_delete_message"),
      [
        { text: t("settings.cancel"), style: "cancel" },
        { text: t("settings.delete_user"), style: "destructive",
          onPress: async () => {
            try {
              await deleteUser();
              Alert.alert(t("settings.user_deleted"));
              navigation.navigate("Koti");
            } catch (error) {
              console.error("Virhe poistettaessa:", error);
              Alert.alert(t("error"), error.message);
            }
          }}]);};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{t("settings.settings")}</Text>
          <Text style={styles.label}>{t("settings.theme")}</Text>
          <TouchableOpacity
            style={isDarkMode ? styles.buttonDark : styles.buttonLight}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={styles.buttonText}>
              {isDarkMode ? t("settings.dark_theme") : t("settings.light_theme")}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>{t("settings.language_settings")}</Text>

          <View style={styles.languageContainer}>
            <TouchableOpacity style={styles.languageButton} onPress={() => handleLanguageChange("fi")}>
              <Text style={styles.languageText} >{t("finnish")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.languageButton} onPress={() => handleLanguageChange("en")}>
              <Text style={styles.languageText}>{t("english")}</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.emailCard}>
        <Card.Content>
            <Text style={styles.title}>{t("settings.change_email")}</Text>
            <TextInput
                label={t("settings.new_email")}
                value={newEmail}
                onChangeText={setNewEmail}
                style={styles.input}
                mode="outlined"
            />
            <TouchableOpacity 
                style={[styles.updateButton, !auth.currentUser && styles.disabledButton]}
                onPress={handleUpdateEmail}
                disabled={!auth.currentUser}>
                <Text style={{color: "white"}}>{t("settings.send_verification_link")}</Text>
            </TouchableOpacity>
        </Card.Content>
    </Card>
    <Portal>
        <Dialog style={styles.dialog} visible={showReauthDialog} onDismiss={cancelReauthentication}>
            <Dialog.Title style={styles.dialogTitle}>{t("settings.verify_identity")}</Dialog.Title>
            <Dialog.Content>
                <Text style={styles.dialogText}>
                    {t("settings.verify_identity_message")}
                </Text>
                <TextInput
                    label={t("settings.password")}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.dialogInput}
                    mode="outlined"
                />
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={cancelReauthentication}>{t("settings.cancel")}</Button>
                <Button onPress={reauthenticateAndUpdateEmail}>{t("settings.verify")}</Button>
            </Dialog.Actions>
        </Dialog>
    </Portal>

      <Card style={styles.card}>
        <Card.Content>
            <Text style={styles.title}>{t("settings.delete_user")}</Text>
            <Button 
                mode="contained" 
                style={styles.deleteButton}
                labelStyle={{color: "white" }}
                onPress={confirmDelete}
                disabled={!auth.currentUser}>
                {t("settings.delete_user")}
            </Button>
        </Card.Content>
    </Card>
    </ScrollView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    card: {
      width: "80%",
      padding: 20,
      backgroundColor: theme.colors.primary,
      marginBottom: 15,
      marginTop: 15,
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
      marginTop: 0,
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
    emailCard: {
      width: "80%",
      padding: 20,
      backgroundColor: theme.colors.primary,
      marginBottom: 15,
      marginTop: 15,
    },
    input: {
      marginBottom: 10,
      backgroundColor: theme.colors.white,
    },
    updateButton: {
      padding: 10,
      marginVertical: 5,
      borderRadius: 5,
      alignItems: "center",
      backgroundColor: theme.colors.secondary,
    },
    disabledButton: {
      opacity: 0.5,
    },
    dialog: {
      backgroundColor: theme.colors.secondary,
    },
    dialogTitle: {
      color: theme.colors.white,
    },
    dialogText: {
      color: theme.colors.white,
    },
    dialogInput: {
      backgroundColor: theme.colors.white,
    },
  });

export default SettingScreen;
