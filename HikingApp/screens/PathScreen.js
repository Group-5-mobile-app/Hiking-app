import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, View, TouchableOpacity } from "react-native";
import { Appbar, Button, Card, Snackbar, TextInput, Text, useTheme } from "react-native-paper";
import StarRating from 'react-native-star-rating-widget';
import { getUserRoutes, savePath, getUserPaths, uploadedRoutes } from "../firebase/firestore";
import { useTranslation } from "react-i18next";


const PathScreen = ({ navigation }) => {
    const [viewMode, setViewMode] = useState("list");
    const [name, setName] = useState("");
    const [length, setLength] = useState("");
    const [message, setMessage] = useState("");
    const [paths, setPaths] = useState([]);
    const [completedWalks, setCompletedWalks] = useState([]);
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
        fetchCompleted();
    }, []);
    
    const fetchCompleted = async () => {
        try {
            const fetchedCompleted = await getUserRoutes();
            setCompletedWalks(fetchedCompleted);
        } catch (error) {
            console.error("Error", error);
        }
    }

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

    const handleRatingChange = (walkId, newRating) => {
        setCompletedWalks((prev) => 
            prev.map((walk) => 
                walk.id === walkId ? { ...walk, rating: newRating } : walk
            )
        );
    };

    const uploadWalkToProfile = async (walk) => {
        try {
            await uploadedRoutes(walk, walk.rating || 0, walk.completedAt?.seconds);
            setMessage("Walk uploaded successfully!");
        } catch (error) {
            console.error("Failed to upload walk", error);
            setMessage("Failed to upload walk.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                <Button
                    mode="contained"
                    style={styles.button}
                    onPress={() => setViewMode("completed")}
                >
                    {t("path.completed_walks")}
                </Button>
                <Button
                    mode="contained"
                    style={styles.button}
                    onPress={() => navigation.navigate("Kartta")}
                >
                    {t("path.add_route")}
                </Button>
            </View>
            {viewMode === "list" && (
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
                                {formatDistance(item.length)} - {formatDate(item.completedAt)}
                            </Text>
                            </Card.Content>
                        </Card>
                        </TouchableOpacity>
                    )}
                />
                    <Button mode="contained" style={styles.button} onPress={() => navigation.navigate("Tracker", {mode: "new"})}>
                        Start Track
                    </Button>
                </>
            )}
            {viewMode === "completed" && (
                <>
                    <Text style={styles.title}>Completed Walks</Text>
                    <FlatList
                        data={completedWalks}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <Card style={styles.card}>
                                <Card.Content>
                                    <Text style={styles.pathName}>{item.name}</Text>
                                    <Text style={styles.pathDetails}>
                                        {formatDistance(item.length)} - {formatDate(item.completedAt?.seconds)}
                                    </Text>

                                    <StarRating
                                    rating={item.rating || 0}
                                    onChange={(newRating) => handleRatingChange(item.id, newRating)}
                                    />

                                    <Button mode="contained" onPress={() => uploadWalkToProfile(item)}>
                                        {t("path.to_profile")}
                                    </Button>
                                </Card.Content>
                            </Card>
                        )}
                    />
                    <Button mode="contained" style={styles.button} onPress={() => setViewMode("list")}>
                        Back
                    </Button>
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
        marginBottom: 10,
        backgroundColor: theme.colors.primary,
      },
 });

export default PathScreen;