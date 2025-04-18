import React, { useState, useEffect, useRef } from "react";
import { Alert, StyleSheet, View, } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import MapView, { Polyline, UrlTile } from "react-native-maps";
import * as Location from 'expo-location'
import { saveRoute } from "../firebase/firestore";

const RouteTracker = ({ route, navigation, basePath: propBasePath, mode: propMode, onTrackingEnd }) => {
    const basePath = route?.params?.basePath || propBasePath || [];
    const mode = route?.params?.mode || propMode || "new";

    const [coords, setcoords] = useState([]);
    const [finalCoords, setFinalCoords] = useState([]);
    const [tracking, setTracking] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [distance, setDistance] = useState(0);
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const [routeName, setRouteName] = useState("");
    const watchRef = useRef(null);
    const coordsRef = useRef([]);
    const mapRef = useRef(null);

    useEffect(() => {
        console.log("RouteTracker loaded with:", { basePath, mode });
    }, []);

    const calculateDistance = (coord1, coord2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371000;
        const dLat = toRad(coord2.latitude - coord1.latitude);
        const dLon = toRad(coord2.longitude - coord1.longitude);
        const lat1 = toRad(coord1.latitude);
        const lat2 = toRad(coord2.latitude);

        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const startTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission denied");
            return;
        }

        setcoords([]);
        coordsRef.current = []; 
        setFinalCoords([]);
        setStartTime(Date.now());
        setDistance(0);

        watchRef.current = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 3 },
            (location) => {
                const newCoord = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                };

                setcoords((prev) => {
                    const updated = [...prev, newCoord];
                    coordsRef.current = updated; // Keep latest coords in ref

                    if (prev.length > 0) {
                        const segmentDistance = calculateDistance(prev[prev.length - 1], newCoord);
                        setDistance((d) => d + segmentDistance);
                        console.log("Added segment distance:", segmentDistance, "Total distance:", distance + segmentDistance);
                    } else {
                        console.log("First coordinate added");
                    }

                    if (mapRef.current) {
                        mapRef.current.animateCamera({
                            center: {
                                latitude: newCoord.latitude,
                                longitude: newCoord.longitude, 
                            },
                            zoom: 19, // zoom level for a "walkable" view
                            heading: location.coords.heading ?? 0, // nice if user is moving
                            pitch: 45,  // tilt the map slightly for a 3D effect
                        }, { duration: 500 });  // smooth 0.5 sec transition
                    }

                    console.log("New coordinate:", newCoord);
                    console.log("Total coords count:", updated.length);

                    return updated;
                });
            }
        );
        setTracking(true);
    };

    const stopTracking = async () => {
        console.log("Stop tracking called");

        watchRef.current?.remove();
        setTracking(false);
        console.log("Tracking stopped");

        const currentCoords = coordsRef.current;

        if (mode === "new" && currentCoords.length > 1) {
            await fetchEnhancedRoute(currentCoords);
        } else {
            console.log("Not enough coords to fetch enhanced route:", currentCoords.length);
        }
        console.log("Showing name prompt");
        setShowNamePrompt(true);
    };

    const fetchEnhancedRoute = async (coords) => {
        console.log("Entered fetchEnhancedRoute");

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
            console.log("Route response:", data);

            if (data?.features[0]) {
                const line = data.features[0].geometry.coordinates.map(([lng, lat]) => ({
                    latitude: lat,
                    longitude: lng,
                }));
                setFinalCoords(line);
            } else {
                console.warn("No features in response");
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
            ref={mapRef}
            style={{ flex:1 }}
            showsUserLocation={true}
            followsUserLocation={false}
            initialRegion={{
                latitude: coords[0]?.latitude || 60.1695,
                longitude: coords[0]?.longitude || 24.9354,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
            }}
            >
            <UrlTile 
            urlTemplate="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
            />

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
                    strokeColor="green"
                    strokeWidth={4}
                    />
                )}

                {(mode === "custom" || mode === "public") && coords.length > 0 && (
                    <Polyline
                        coordinates={finalCoords}
                        strokeColor="orange"
                        strokeWidth={3}
                    />
                )}
                
                {mode === "new" && finalCoords.length > 0 && (
                    <Polyline
                    coordinates={finalCoords}
                    strokeColor={mode === "custom" ? "green" : "green"}
                    strokeWidth={4}
                    />
                )}
            </MapView>

            {showNamePrompt && (
                <View style={styles.promptOverlay}>
                    {console.log("Rendering name prompt")}
                    <View style={styles.promptBox}>
                        <Text>Name your route:</Text>
                        <TextInput
                        placeholder="Route name"
                        value={routeName}
                        onChangeText={setRouteName}
                        style={styles.input}
                        />
                        <Button onPress={async () => {
                            setShowNamePrompt(false);
                            if (!routeName) return;

                            const duration = getDuration();
                            const lengthInM = Math.round(distance);
                            const cleanedPath = finalCoords.length > 0 ? finalCoords : coordsRef.current;

                            const routeData = {
                                name: routeName,
                                length: lengthInM,
                                duration,
                                path: cleanedPath
                            };

                            const success = await saveRoute(routeData);

                            if (success) {
                                Alert.alert("Success", "Route saved");
                                if (navigation) {
                                    navigation.navigate("Paths");
                                }
                                if (onTrackingEnd) {
                                    onTrackingEnd();
                                }
                            } else {
                                Alert.alert("Error")
                            }
                        }}>
                            Save
                        </Button>
                    </View>    
                </View>
            )}

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
        promptOverlay: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        promptBox: {
            width: '80%',
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            elevation: 5,
        },
        input: {
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 6,
            marginTop: 10,
            padding: 8,
            width: '100%',
            marginBottom: 10,
        }
    });

    export default RouteTracker;

