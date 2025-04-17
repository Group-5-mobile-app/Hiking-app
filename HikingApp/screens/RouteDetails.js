import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Appbar  } from "react-native-paper";
import MapView, { Polyline, UrlTile } from "react-native-maps";

const RouteDetails = ({ route, navigation }) => {
    const { path, name, length, duration, createdAt } = route.params;

        const theme = useTheme();
        const styles = getStyles(theme);

    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs}h ${mins}m ${secs}s`;
    };

    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={{ flex: 1 }}
                region={{
                    latitude: path[0]?.latitude,
                    longitude: path[0]?.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                >
                
                <UrlTile 
                    urlTemplate="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                />
                <Polyline
                coordinates={path}
                strokeColor="blue"
                strokeWidth={4}
                />
            </MapView>
            <View style={styles.infoBox}>
                <Text style={styles.title}>{name}</Text>
                <Text>Length: {(length/1000).toFixed(2)} km</Text>
                <Text>Duration: {formatDuration(duration)}</Text>
                <Text>Date: {createdAt}</Text>
            </View>
        </View>
    );
};

const getStyles = (theme) =>
    StyleSheet.create({
    infoBox: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        elevation: 5,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 8,
    },
});

export default RouteDetails;