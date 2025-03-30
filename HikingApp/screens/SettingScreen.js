import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import theme from "../components/theme";

const SettingScreen = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.title}>Asetukset</Text>
                    <Text style={styles.label}>Vaihda sovelluksen teema</Text>
                    <TouchableOpacity
                        style={[styles.button, isDarkMode ? styles.buttonActive : styles.buttonInactive]}
                        onPress={() => setIsDarkMode(!isDarkMode)}>
                        <Text style={[styles.buttonText, !isDarkMode ? { color: theme.colors.black } : {}]}>
                            {isDarkMode ? "Tumma teema" : "Vaalea teema"}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.label}>Kieliasetukset</Text>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity style={[styles.button, styles.languageButton]}>
                            <Text style={styles.buttonText}>Suomi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.languageButton]}>
                            <Text style={styles.buttonText}>Englanti</Text>
                        </TouchableOpacity>
                    </View>
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
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
    button: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonActive: {
        backgroundColor: theme.colors.secondary,
    },
    buttonInactive: {
        backgroundColor: theme.colors.white,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
    },
    languageContainer: {
        backgroundColor: theme.colors.primary,
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    languageButton: {
        backgroundColor: theme.colors.secondary,
    },
});

export default SettingScreen;
