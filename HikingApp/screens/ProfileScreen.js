import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { auth} from "../firebase/firebaseConfig";
import theme from "../components/theme";
import { deleteDocument } from "../firebase/firestore";


const ProfileScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (auth.currentUser) {
            setEmail(auth.currentUser.email);
        }
    }, []);

    const confirmDelete = () => {
        Alert.alert(
            "Vahvista poisto", 
            "Oletko varma, että haluat poistaa käyttäjätilisi? Tätä ei voi perua.", 
            [{text: "Peruuta"},
                {text: "Poista",
                onPress: handleDelete 
                }]);};

    const handleDelete = async () => {
        try {
            console.log("Attempting to delete user:", auth.currentUser.uid);
            const user = await deleteDocument("user", auth.currentUser.uid);
            console.log("User document deleted from Firestore.");
            await auth.currentUser.delete();
            console.log("User deleted from Authentication.");

            Alert.alert("Käyttäjä poistettu");
            navigation.navigate("Koti");
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", error.message);
        }
    };


    return (
<View style={styles.container}>
    <Card style={styles.card}>
        <Card.Content>
            <Text style={styles.title}>Profiili</Text>
            <Text style={styles.label}>Käyttäjä: {email}</Text>
        </Card.Content>
    </Card>

    <Card style={styles.deleteCard}>
        <Card.Content>
            <Text style={styles.title}>Poista käyttäjä</Text>
            <Button 
                mode="contained" 
                style={styles.button}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.colors.background,
        paddingVertical: 20,
    },
    card: {
        width: "80%",
        padding: 20,
        backgroundColor: theme.colors.primary,
    },
    deleteCard: {
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
    button: {
        marginTop: 20,
        backgroundColor: theme.colors.red
    },
        email: {
        fontSize: 16,
        marginBottom: 20,
        color: theme.colors.text,
    },
});


export default ProfileScreen;