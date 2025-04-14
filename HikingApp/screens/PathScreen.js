import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, View, TouchableOpacity } from "react-native";
import { Appbar, Button, Card, Snackbar, TextInput, Text, useTheme } from "react-native-paper";
import { savePath } from "../firebase/firestore";
import { getUserPaths } from "../firebase/firestore";
import { useTranslation } from "react-i18next";


const PathScreen = ({ navigation }) => {
    const [viewMode, setViewMode] = useState("list");
    const [name, setName] = useState("");
    const [length, setLength] = useState("");
    const [message, setMessage] = useState("");
    const [paths, setPaths] = useState([]);
    const { t } = useTranslation();

    const theme = useTheme();
    const styles = getStyles(theme);

    useEffect(() => {
        const loadPaths = async () => {
            try {
                const fetchedPaths = await getUserPaths();
                setPaths(fetchedPaths);
            } catch (error) {
                console.error("Error loading paths", err);
            }
        };
        loadPaths();
    }, []);

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

    const formatDistance = (length) => {
        if (!length || isNaN(length)) return "–";
        const km = length / 1000;
        return km < 1 ? `${length.toFixed(0)} m` : `${km.toFixed(2)} km`;
    };

    const formatDate = (timestampInSeconds) => {
        if (!timestampInSeconds) return "";
        const date = new Date(timestampInSeconds * 1000);
        return date.toLocaleDateString();
    }

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.appbar}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Polut" />
            </Appbar.Header>

            {viewMode === "list" ? (
                <>
                <Text style={styles.title}>{t("path.routes")}</Text>
                <FlatList
                    data={paths}
                    keyExtractor={(item) => item.id || item.name}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => navigation.navigate("PathDetail", { path: item })}>
                        <Card style={styles.card}>
                            <Card.Content>
                            <Text style={styles.pathName}>{item.name}</Text>
                            <Text style={styles.pathDetails}>
                                {formatDistance(item.length)} - {formatDate(item.createdAt?.seconds)}
                            </Text>
                            </Card.Content>
                        </Card>
                        </TouchableOpacity>
                    )}
                />

                <Button mode="contained" style={styles.button} onPress={() => navigation.navigate("Kartta",)}>
                    {t("path.add_route")}
                </Button>
                </>
            ) : (
                <>
                    <Text style={styles.title}>{t("path.add_route")}</Text>
                    <TextInput 
                        mode="outlined"
                        label={t("path.name")}
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        mode="outlined"
                        label={t("path.length")}
                        keyboardType="numeric"
                        value={length}
                        onChangeText={setLength}
                    />

                    <Button mode="contained" style={styles.button} onPress={handleSavePath}>
                        {t("path.save_route")}
                    </Button>
                    <Button mode="outlined" style={styles.button} onPress={() => setViewMode("list")}>
                        {t("path.back")}
                    </Button>
                    <Snackbar visible={!!message} onDismiss={() => setMessage("")}>
                        {message}
                    </Snackbar>
                </>
            )}
            
        </View>
    );
};

const getStyles = (theme) =>
    StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      appbar: {
        backgroundColor: theme.colors.primary,
      },
      title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: theme.colors.text,
      },
      card: {
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
      },
      pathName: {
        fontSize: 18,
        color: theme.colors.text,
      },
      pathDetails: {
        fontSize: 14,
        color: theme.colors.text,
      },
      button: {
        marginTop: 20,
        backgroundColor: theme.colors.primary,
      },
 });

export default PathScreen;