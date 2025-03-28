import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from 'expo-location'

const API_KEY = "e6311845-2b5c-4e0f-babc-83539e8434e7";
const CAPABILITIES_URL = "https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts/1.0.0/WMTSCapabilities.xml";

const MapScreen = () => {
  const [restStops, setRestStops] = useState([]);
  const [position, setPosition] = useState(null)

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
      >
        <UrlTile 
        urlTemplate="https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts/1.0.0/maastokartta/default/WGS84_Pseudo-Mercator/{z}/{x}/{y}.png"
        zIndex={1}
        />

        {restStops.map((stop, index) => (
          <Marker 
          key={index}
          coordinate={{
            latitude: stop.latitude,
            longitude: stop.longitude,
          }}
          title={stop.nimi}
          description={`Type: ${stop.tyyppi}`}
          />
        ))}
      </MapView>
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
});

export default MapScreen;