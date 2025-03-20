import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Button, Text, TextInput, Card } from "react-native-paper";

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
                        textColor="white"
                        style={styles.input}
                    />

                    <Text style={styles.spacing}>Salasana</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="Lisää salasana"
                        value={password}
                        secureTextEntry
                        onChangeText={setPassword}
                        textColor="white"
                        style={styles.input}
                    />

                    <Text style={styles.spacing}>Salasana uudelleen</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="Varmista salasana"
                        value={password}
                        secureTextEntry
                        onChangeText={setPassword}
                        textColor="white"
                        style={styles.input}
                    />

                    <Button mode="contained" style={styles.button}>
                        Luo tili
                    </Button>

                    <TouchableOpacity onPress={() => navigation.navigate("Kirjaudu")}>
                        <Text style={styles.link}>Minulla on jo tili.</Text>
                    </TouchableOpacity>
                </Card.Content>
            </Card>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#616161",
    },
    title: {
        fontSize: 22,
        color: "#FFFFFF",
        marginBottom: 20,
        fontWeight: "bold",
        padding: 20,
    },
    card: {
        padding: 20,
        borderRadius: 10,
    },
    label: {
        color: "#FFFFF",
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#757575",
    },
    button: {
        marginTop: 20,
    },
    link: {
        textAlign: "center",
        marginTop: 20,
        color: "#689f38",
    },
});

export default SignUpScreen;