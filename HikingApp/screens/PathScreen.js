import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Appbar, Button, Card, Snackbar, TextInput, Text } from "react-native-paper";
import { savePath } from "../firebase/firestore";


const PathScreen = ({ navigation }) => {
    const [viewMode, setViewMode] = useState("list");
    const [name, setName] = useState("");
    const [length, setLength] = useState("");
    const [message, setMessage] = useState("");

    const paths = [
        { id: "1", name: "MetsäPolku", length: "10km" },
        { id: "2", name: "MaastoPolku", length: "15km" },
    ];

    const handleSavePath = async () => {
        if (!name || !length) {
            setMessage("Täytä kaikki kentät!");
            return;
        }

        const success = await savePath(name, parseFloat(length), []);
        if (success) {
            setMessage("Reitti tallennettu onnistuneesti!");
            setName("");
            setLength("");
            setViewMode("list");
        } else {
            setMessage("Virhe tallentaessa reittiä.");
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.appbar}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Polut" />
            </Appbar.Header>

            {viewMode === "list" ? (
                <>
                <Text style={styles.title}>Valmiit Reitit</Text>
                <FlatList 
                    data={paths}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.pathName}>{item.name}</Text>
                                <Text style={styles.pathDetails}>{item.length}</Text>
                            </Card.Content>
                        </Card>
                    )}
                />

                <Button mode="contained" style={styles.button} onPress={() => setViewMode("add")}>
                    Lisää Reitti
                </Button>
                </>
            ) : (
                <>
                    <Text style={styles.title}>Lisää Oma Reitti</Text>
                    <TextInput 
                        mode="outlined"
                        label="Reitin nimi"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        mode="outlined"
                        label="pituus"
                        keyboardType="numeric"
                        value={length}
                        onChangeText={setLength}
                    />

                    <Button mode="contained" style={styles.button} onPress={handleSavePath}>
                        Tallenna Reitti
                    </Button>
                    <Button mode="outlined" style={styles.button} onPress={() => setViewMode("list")}>
                        Takaisin
                    </Button>
                    <Snackbar visible={!!message} onDismiss={() => setMessage("")}>
                        {message}
                    </Snackbar>
                </>
            )}
            
        </View>
    );
};

 const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        backgroundColor: "#616161",
      },
      appbar: {
        backgroundColor: "#689f38",
      },
      title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#ffffff"
      },
      card: {
        backgroundColor: "#424242",
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
      },
      pathName: {
        fontSize: 18,
        color: "#fffff",
      },
      pathDetails: {
        fontSize: 14,
        color: "#b0bec5",
      },
      button: {
        marginTop: 20,
        backgroundColor: "#689f38",
      },
 });

export default PathScreen;