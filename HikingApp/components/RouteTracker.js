import React, { useState, useEffect, useRef } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import MapView, { Polyline } from "react-native-maps";
import * as Location from 'expo-location'
import { saveRoute } from "../firebase/firestore";

const RouteTracker = ({ route, navigation, basePath: propBasePath, mode: propMode }) => {
    const basePath = route?.params?.basePath || propBasePath || [];
    const mode = route?.params?.mode || propMode || "new";

    const [coords, setcoords] = useState([]);
    const [finalCoords, setFinalCoords] = useState([]);
    const [tracking, setTracking] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [distance, setDistance] = useState(0);
    const watchRef = useRef(null);

    useEffect(() => {
        console.log("RouteTracker loaded with:", { basePath, mode });
      }, []);

    const calculateDistance = (coord1, coord2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371000;
        const dLat = toRad(coord2.latitude - coord1.latitude);
        const dLon = toRad(coord2.longitude, coord1.longitude);
        const lat1 = toRad(coord1.latitude);
        const lat2 = toRad(coord2.latitude);

        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(1 - a));
        return R * c;
    };

    const startTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission denied");
            return;
        }

        setcoords([]);
        setFinalCoords([]);
        setStartTime(Date.now());
        setDistance(0);

        watchRef.current = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 5 },
            (location) => {
                const newCoord = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                };
                setcoords((prev) => {
                    const updated = [...prev, newCoord];
                    if (prev.length > 0) {
                        setDistance((d) => d + calculateDistance(prev[prev.length - 1], newCoord));
                    }
                    return updated;
                });
            }
        );
        setTracking(true);
    };

    const stopTracking = async () => {
        watchRef.current?.remove();
        setTracking(false);

        if (mode === "new" && coords.length > 1) {
            await fetchEnhancedRoute(coords);
        }

        Alert.prompt(
            "Route name",
            "Give your route a name: ",
            async (name) => {
                if (!name) return;

                const duration = getDuration();
                const lengthInMeters = Math.round(distance);
                const cleanedPath = finalCoords.length > 0 ? finalCoords : coords;

                const routeData = {
                    name,
                    length: lengthInMeters,
                    duration,
                    path: cleanedPath
                };

                const success = await saveRoute(routeData);

                if (success) {
                    Alert.alert("Success", "Route saved");
                    navigation?.navigate("Paths");
                } else {
                    Alert.alert("Error", "Failed to save");
                }
            }
        );
    };

    const fetchEnhancedRoute = async (coords) => {

        if (!coords || coords.length < 2) {
            console.warn("Not enough coordinates to enhance route.");
            return;
        }
        
        try {
            const response = await fetch("https://hiking-app-flask.onrender.com/get_route", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    waypoints: coords.map((c) => ({
                        latitude: c.latitude,
                        longitude: c.longitude,
                    })),
                }),
            });

            const data = await response.json();
            if (data?.features[0]) {
                const line = data.features[0].geometry.coordinates.map(([lng, lat]) => ({
                    latitude: lat,
                    longitude: lng,
                }));
                setFinalCoords(line);
            }

        } catch (error) {
            console.error("ORS route fetch failed:", error);
        }
    };

    const getDuration = () => {
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000);
    };

    return (
        <View style={{ flex:1 }}>
            <MapView
            style={{ flex:1 }}
            showsUserLocation={true}
            region={{
                latitude: coords[0]?.latitude || 60.1695,
                longitude: coords[0]?.longitude || 24.9354,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
            >
                {mode === "new" && coords.length > 0 && (
                    <Polyline
                    coordinates={coords}
                    strokeColor="blue"
                    strokeWidth={3}
                    />
                )}
                {(mode === "custom" || mode === "public") && basePath.length > 0 && (
                    <Polyline
                    coordinates={basePath}
                    strokeColor={mode === "custom" ? "orange" : "purple"}
                    strokeWidth={3}
                    />
                )}
                {mode === "new" && finalCoords.length > 0 && (
                    <Polyline
                    coordinates={finalCoords}
                    strokeColor="green"
                    strokeWidth={4}
                    />
                )}
            </MapView>

            <View style={styles.panel}>
                <Text>Time: {getDuration()} s</Text>
                <Text>Distance: {(distance / 1000).toFixed(2)} km</Text>
                {(mode === "new" || mode === "custom" || mode === "public") && (
                    <>
                    {!tracking ? (
                        <Button mode="contained" onPress={startTracking}>Start Track</Button>
                    ) : (
                        <Button mode="contained" onPress={stopTracking}>Stop & save</Button>
                    )}
                    </>
                )}
            </View>
        </View>
    )
};

    const styles = StyleSheet.create({
        panel: {
            position: "absolute",
            bottom: 40,
            left: 20,
            right: 20,
            backgroundColor: "white",
            padding: 16,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 5,
        },
    });

    export default RouteTracker;

