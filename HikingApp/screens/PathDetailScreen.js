import React, { useState } from "react";
import { View, StyleSheet, Text} from "react-native";
import MapView, { Polyline, UrlTile } from "react-native-maps";
import { Appbar, Button, useTheme } from "react-native-paper";
import { useSSR, useTranslation } from "react-i18next";

const PathDetailScreen = ({ route, navigation }) => {
    const { path } = route.params;
    const { t } = useTranslation();

    const theme = useTheme();
    const styles = getStyles(theme);

    return (
        <View style={{ flex: 1 }}>
            <MapView
            style={{ flex: 1 }}
            region={{
                latitude: path.routePath[0].latitude,
                longitude: path.routePath[0].longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
            >
                <UrlTile
                urlTemplate="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
                />
                {path.routePath && path.routePath.length > 0 && (
                    <Polyline coordinates={path.routePath} strokeColor="green" strokeWidth={4} />
                )}
            </MapView>
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>{t("path.detail.length")}: {formatDistance(path.length)}</Text>
                <Text style={styles.infoText}>{t("path.detail.created")}: {formatDate(path.createdAt?.seconds)}</Text>
                <Text style={styles.infoText}>{t("path.detail.steps")}: {path.steps}</Text>
                <Button mode="contained" style={styles.followButton} labelStyle={styles.whiteLabel} onPress={() => navigation.navigate("Tracker", {basePath: path.routePath, mode: "custom"})}>
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

  const getStyles = (theme) =>
    StyleSheet.create({
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
        backgroundColor: theme.colors.primary,
      },
    whiteLabel: {
        color: theme.colors.white,
    },
});

export default PathDetailScreen;