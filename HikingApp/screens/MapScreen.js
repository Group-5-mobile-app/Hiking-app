import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Alert, FlatList, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, UrlTile, Polyline } from "react-native-maps";
import { Button, TextInput } from "react-native-paper";
import * as Location from 'expo-location'
import { Ionicons } from "@expo/vector-icons";
import { savePath } from "../firebase/firestore";
import { Checkbox } from "react-native-paper";
import Slider from '@react-native-community/slider';

const SERVER_URL = "http://192.168.1.106:5000"; // here is your local IP address
const API_KEY = "e6311845-2b5c-4e0f-babc-83539e8434e7";
  
const AVAILABLE_TYPES = [
  "Nuotiopaikka", "Laavu", "Kota", "Varaustupa", "Autiotupa", "Porokämppä",
  "Päivätupa", "Kammi", "Sauna", "Ruokailukatos", "Lintutorni",
  "Nähtävyys", "Luola", "Lähde"
]; // Filter options

const iconMap = {
  Nuotiopaikka: require("../assets/icons/nuotiopaikka.png"),
  Laavu: require("../assets/icons/laavu.png"),
};

const MapScreen = () => {
  const [restStops, setRestStops] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const [routeName, setRouteName] = useState("");
  const [isAdding, setIsAdding] = useState(false); 
  const [filteredStops, setFilteredStops] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([""]); // Default type
  const [position, setPosition] = useState(null);
  const [showFilters, setShowFilters] = useState(false); // Toggle filter visibility
  const [radius, setRadius] = useState(50); // radius in kilometers
  const [debouncedRadius, setDebouncedRadius] = useState(50); // for debounced radius
  
  const debounceTimeout = useRef(null);
  
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

  useEffect(() => {
    if (position && restStops.length && debouncedRadius) {
      filterStops(restStops, selectedTypes, position, debouncedRadius);
    }
  }, [restStops, selectedTypes, position, debouncedRadius]);  

  const fetchRestStops = async () => {
    try {
      const response = await fetch("https://tulikartta.fi/api-json2.php");
      const data = await response.json();
      //console.log("Raw API Response:", data);
      const parsedStops = data
      .filter((item) => item.koordinaatti && item.koordinaatti.includes(","))
      .map((item) => {
        const [latStr, lonStr] = item.koordinaatti.split(",");
        const latitude = parseFloat(latStr.trim());
        const longitude = parseFloat(lonStr.trim());
    
        if (isNaN(latitude) || isNaN(longitude)) {
          console.warn("Skipping invalid coordinate:", item.koordinaatti, item.nimi); // Debug here
          return null;
        }
    
        return { ...item, latitude, longitude };
      })
      .filter(Boolean); // Remove null entries

      setRestStops(parsedStops);
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

  const filterStops = (stops, types, position, radius) => {
    if (!position || radius <= 0) return;
    
    const nearbyStops = stops.filter((stop) => {
      const inType = types.includes(stop.tyyppi);
      const distance = getDistanceFromLatLonInKm(
        position.latitude,
        position.longitude,
        stop.latitude,
        stop.longitude
      );
      return inType && distance <= radius;
    });

    console.log("Filtered nearby stops:", nearbyStops.length);
    if (nearbyStops.length !== filteredStops.length) {
      setFilteredStops(nearbyStops);
    }
  };

  const getMarkerIcon = (type) => {
    return iconMap[type];
  };

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const toggleType = (type) => {
    let updatedSelection;
    if (selectedTypes.includes(type)) {
      updatedSelection = selectedTypes.filter(t => t !== type);
    } else {
      updatedSelection = [...selectedTypes, type];
    }
    setSelectedTypes(updatedSelection);
    filterStops(restStops, updatedSelection);
  };

  const handleRadiusChange = (value) => {
    setRadius(value);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current); // Clear the previous timeout
    }
    debounceTimeout.current = setTimeout(() => {
      setDebouncedRadius(value); // Update debounced value after a delay
    }, 500); // 500ms delay
  };

  const calculateDistance = (coordinates) => {
    let total = 0;
    for (let i = 1; i < coordinates.length; i++) {
      total += getDistanceFromLatLonInKm(
        coordinates[i - 1].latitude,
        coordinates[i - 1].longitude,
        coordinates[i].latitude,
        coordinates[i].longitude
      );
    }
    return total * 1000;
  };

  return (
    <View style={styles.container}>
      {/* Toggle Button to Show/Hide Filters */}
      <TouchableOpacity style={styles.toggleButton} onPress={() => setShowFilters(!showFilters)}>
        <Text style={styles.toggleButtonText}>{showFilters ? "Hide Filters" : "Show Filters"}</Text>
      </TouchableOpacity>

      {/* Conditional Rendering for Filters */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <View style={styles.checkboxGrid}>
            {AVAILABLE_TYPES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.checkboxWrapper,
                  selectedTypes.includes(item) && styles.checkboxWrapperSelected,
                ]}
                onPress={() => toggleType(item)}
              >
                <Checkbox
                  status={selectedTypes.includes(item) ? "checked" : "unchecked"}
                  onPress={() => toggleType(item)}
                />
                <Text style={styles.checkboxLabel}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Radius Slider */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Radius: {radius} km</Text>
            <Slider
              minimumValue={1}
              maximumValue={200}
              step={1}
              //value={radius}
              onValueChange={handleRadiusChange}
              style={styles.slider}
            />
          </View>
        </View>
      )}

      <MapView
        style={styles.map}
        region={position || {
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

        {filteredStops.map((stop, index) => {
          if (
            typeof stop.latitude !== "number" ||
            typeof stop.longitude !== "number" ||
            isNaN(stop.latitude) ||
            isNaN(stop.longitude)
          ) {
            console.warn("Invalid coordinates for stop: ", stop); // Debug
            return null;
          }

          return (
            <Marker 
              key={index}
              coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
              title={stop.nimi}
              description={`Type: ${stop.tyyppi}`}
              image={getMarkerIcon(stop.tyyppi)}
            />
          );
        })}

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
              const lengthInMeters = calculateDistance(routePath);
              await savePath(routeName, lengthInMeters, routePath);
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
  toggleButton: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    zIndex: 10,
  },
  toggleButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: "white",
    position: "absolute",
    top: 60,
    left: 10,
    right: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    zIndex: 9,
    maxHeight: 'auto', // if too many items, it scrolls
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 5,
    alignSelf: "flex-start",
    maxWidth: '48%', // Prevent ultra-wide items on large screens
  },
  checkboxWrapperSelected: {
    backgroundColor: "#cce5ff",
  },
  checkboxLabel: {
    marginLeft: 5,
    fontSize: 14,
  },
  sliderContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  
  sliderLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  
  slider: {
    width: "100%",
    height: 40,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
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
    zIndex: 8,
  },
  inputContainer: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 6,
    zIndex: 12,
  },
  input: {
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    marginBottom: 5,
  },
});

export default MapScreen;
