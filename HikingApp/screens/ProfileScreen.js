import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import { auth} from "../firebase/firebaseConfig";
import theme from "../components/theme";

const ProfileScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (auth.currentUser) {
            setEmail(auth.currentUser.email);
        }
    }, []);

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.title}>Profiili</Text>
                    <Text style={styles.label}>Käyttäjä: {email}</Text>
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
        transform: [{ translateY: -200 }],
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
    email: {
        fontSize: 16,
        marginBottom: 20,
        color: theme.colors.text,
    },
});

export default ProfileScreen;