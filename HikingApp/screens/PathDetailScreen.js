import React from "react";
import { View, StyleSheet, Text} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { Appbar } from "react-native-paper";

const PathDetailScreen = ({ route, navigation }) => {
    const { path } = route.params;

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
                <Text style={styles.infoText}>Length: {formatDistance(path.length)}</Text>
                <Text style={styles.infoText}>Created: {formatDate(path.createdAt?.seconds)}</Text>
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
});

export default PathDetailScreen;