import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Card, Button, TextInput, Dialog, Portal } from "react-native-paper";
import { auth } from "../firebase/firebaseConfig";
import { verifyBeforeUpdateEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import theme from "../components/theme";
import { deleteDocument } from "../firebase/firestore";


const ProfileScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showReauthDialog, setShowReauthDialog] = useState(false);

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

    const handleUpdateEmail = async () => {
        if (!newEmail || newEmail === email) {
            Alert.alert("Virhe", "Syötä uusi sähköpostiosoite");
            return;
        }
        setShowReauthDialog(true);
    };

    const reauthenticateAndUpdateEmail = async () => {
        if (!password) {
            Alert.alert("Virhe", "Syötä salasanasi");
            return;
        }
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Käyttäjää ei löydy");

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
                "Vahvistuslinkki lähetetty", 
                "Vahvistuslinkki on lähetetty uuteen sähköpostiosoitteeseen. Vahvista se aktivoidaksesi uuden sähköpostisi."
            );
            
        } catch (error) {
            console.error("Error updating email:", error);
            Alert.alert("Virhe", error.message);
            setPassword("");
        }
    };

    const cancelReauthentication = () => {
        setPassword("");
        setShowReauthDialog(false);
    };

    return (
<View style={styles.container}>
    <Card style={styles.card}>
        <Card.Content>
            <Text style={styles.title}>Profiili</Text>
            <Text style={styles.label}>Käyttäjä: {email}</Text>
        </Card.Content>
    </Card>

    <Card style={styles.emailCard}>
        <Card.Content>
            <Text style={styles.title}>Päivitä sähköposti</Text>
            <TextInput
                label="Uusi sähköpostiosoite"
                value={newEmail}
                onChangeText={setNewEmail}
                style={styles.input}
                mode="outlined"
            />
            <Button 
                mode="contained" 
                style={styles.updateButton}
                labelStyle={{color: "white" }}
                onPress={handleUpdateEmail}
                disabled={!auth.currentUser}>
                Lähetä vahvistuslinkki
            </Button>
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

    <Portal>
        <Dialog style={styles.dialog} visible={showReauthDialog} onDismiss={cancelReauthentication}>
            <Dialog.Title style={styles.dialogTitle}>Vahvista henkilöllisyytesi</Dialog.Title>
            <Dialog.Content>
                <Text style={styles.dialogText}>
                    Sähköpostiosoitteen muuttaminen vaatii uudelleenkirjautumisen. Syötä salasanasi jatkaaksesi.
                </Text>
                <TextInput
                    label="Salasana"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.dialogInput}
                    mode="outlined"
                />
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={cancelReauthentication}>Peruuta</Button>
                <Button onPress={reauthenticateAndUpdateEmail}>Vahvista</Button>
            </Dialog.Actions>
        </Dialog>
    </Portal>
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
        marginBottom: 20,
    },
    emailCard: {
        width: "80%",
        padding: 20,
        backgroundColor: theme.colors.primary,
        marginBottom: 20,
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
    input: {
        backgroundColor: theme.colors.surface,
        marginBottom: 10,
    },
    button: {
        marginTop: 20,
        backgroundColor: theme.colors.red
    },
    updateButton: {
        marginTop: 20,
        backgroundColor: theme.colors.accent
    },
    email: {
        fontSize: 16,
        marginBottom: 20,
        color: theme.colors.text,
    },
    dialogText: {
        marginBottom: 16,
        color: theme.colors.text,
    },
    dialogInput: {
        backgroundColor: theme.colors.surface,
    },
    dialog: {
        backgroundColor: theme.colors.secondary,
    },
    dialogTitle: {
        color: theme.colors.primary,
    }
});


export default ProfileScreen;
