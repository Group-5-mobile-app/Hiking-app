import React from "react";
import { View, StyleSheet, Text} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { Appbar, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";

const PathDetailScreen = ({ route, navigation }) => {
    const { path } = route.params;
    const { t } = useTranslation();

    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header style={styles.appbar}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={path.name} />
            </Appbar.Header>

            <MapView
            style={{ flex: 1 }}
            initialRegion={{
                latitude: path.routePath[0].latitude,
                longitude: path.routePath[0].longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
            >
                {path.routePath && path.routePath.length > 0 && (
                    <Polyline coordinates={path.routePath} strokeColor="green" strokeWidth={4} />
                )}
            </MapView>
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>{t("path.detail.length")}: {formatDistance(path.length)}</Text>
                <Text style={styles.infoText}>{t("path.detail.created")}: {formatDate(path.createdAt?.seconds)}</Text>

                <Button mode="contained" style={styles.followButton} onPress={() => navigation.navigate("Tracker", {basePath: path.routePath, mode: "custom"})}>
                    Start path
                </Button>
            </View>
        </View>
    );
};

const formatDistance = (length) => {
    const km = length / 1000;
    return km < 1 ? `${length} m` : `${km.toFixed(2)} km`;
  };
  
  const formatDate = (timestampInSeconds) => {
    if (!timestampInSeconds) return "";
    const date = new Date(timestampInSeconds * 1000);
    return date.toLocaleDateString();
  };

const styles = StyleSheet.create({
    appbar: {
        backgroundColor: "#689f38",
    },
    infoContainer: {
        padding: 15,
        backgroundColor: "#e0f2f1",
    },
    infoText: {
        fontSize: 16,
        color: "#333",
    },
    followButton: {
        marginTop: 15,
        backgroundColor: "#689f38",
      },
});

export default PathDetailScreen;