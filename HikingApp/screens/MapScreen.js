import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import MapView, { Marker, UrlTile, Polyline } from "react-native-maps";
import { Button, TextInput } from "react-native-paper";
import * as Location from 'expo-location'
import { Ionicons } from "@expo/vector-icons";
import { savePath } from "../firebase/firestore";

const SERVER_URL = "http://192.168.1.106:5000";
const API_KEY = "e6311845-2b5c-4e0f-babc-83539e8434e7";

const MapScreen = () => {
  const [restStops, setRestStops] = useState([]);
  const [position, setPosition] = useState(null)
  const [waypoints, setWaypoints] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const [routeName, setRouteName] = useState("");
  const [isAdding, setIsAdding] = useState(false); 

  const toggleAddRoute = () => {
    setIsAdding(!isAdding);
    if (!isAdding) {
      setWaypoints([]);
    }
  };

  const handleMapPress = async (event) => {
    if (!isAdding) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;
    const updatedWaypoints = [...waypoints, { latitude, longitude }];
    setWaypoints(updatedWaypoints);

    if (updatedWaypoints.length >= 2) {
      try {
        const response = await fetch(`${SERVER_URL}/get_route`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ waypoints: updatedWaypoints }),
        });
        const data = await response.json();
        if (data.features) {
          const coords = data.features[0].geometry.coordinates.map(coord => ({
            latitude: coord[1], longitude: coord[0]
          }));
          setRoutePath(coords);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    }
  };

  const fetchRoute = async () => {
    if (waypoints.length < 2) {
      Alert.alert("Select at least two points");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/get_route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waypoints }),
      });

      const data = await response.json();
      if (data.features) {
        const coords = data.features[0].geometry.coordinates.map(coord => ({
          latitude: coord[1], longitude: coord[0]
        }));

        setRoutePath(coords);
      } else {
        Alert.alert("Error", "Failed to fetch route");
      }
    } catch (error) {
      console.error("Error fetching route: ", error);
      Alert.alert("Network error");
    }
  };

  useEffect(() => {
    fetchRestStops();
    requestLocationPermission();
  }, []);

  const fetchRestStops = async () => {
    try {
      const response = await fetch("https://tulikartta.fi/api-json2.php");
      const data = await response.json();

      //console.log("Raw API Response:", data);

      const filteredStops = data
      .filter((item) => item.tyyppi === "Nuotiopaikka" && item.koordinaatti)
      .map((item) => {
        const [latitude, longitude] = item.koordinaatti
          .split(",")
          .map(coord => parseFloat(coord.trim())); // Convert to float & trim whitespace

        return { 
          ...item, 
          latitude, 
          longitude 
        };
      });

      //console.log("Filtered Rest Stops (Nuotiopaikka):", filteredStops);

      setRestStops(filteredStops);
    } catch (error) {
      console.error("Error fetching rest stops:", error);
    }
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if(status !== "granted") {
      Alert.alert("Permission Denied", "Allow location access to center the map.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setPosition({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={position || {
          latitude: 60.2,
          longitude: 25.0,
          latitudeDelta: 2.5,
          longitudeDelta: 2.5,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={handleMapPress} // Allow pressing only when adding mode is active
      >
        <UrlTile 
          urlTemplate="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {restStops.map((stop, index) => (
          <Marker 
            key={index}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.nimi}
            description={`Type: ${stop.tyyppi}`}
          />
        ))}

        {/* Render Waypoints */}
        {waypoints.map((point, index) => (
          <Marker key={index} coordinate={point} title={`Point ${index + 1}`} />
        ))}

        {/* Draw Route Path */}
        {waypoints.length > 1 && (
          <Polyline coordinates={routePath} strokeWidth={4} strokeColor="green" />
        )}
      </MapView>

      {/* Show input field and save button only when adding mode is active */}
      {isAdding && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Route Name"
            value={routeName}
            onChangeText={setRouteName}
          />
          <Button 
            mode="contained" 
            onPress={async () => {
              await fetchRoute();
              savePath(routeName, routePath);
              setIsAdding(false);
            }} 
            style={styles.saveButton}
            >
            Save Path
          </Button>
          <Button
          mode="outlined"
          onPress={() => {
            setWaypoints(prev => prev.slice(0, -1));
            setRoutePath([]);
          }}
          style={{ marginTop: 10 }}
          >
            Undo
          </Button>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={toggleAddRoute}>
        <Ionicons name={isAdding ? "close" : "add"} size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#689f38",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default MapScreen;