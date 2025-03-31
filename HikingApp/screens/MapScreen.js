import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from "react-native-maps";

const API_KEY = "e6311845-2b5c-4e0f-babc-83539e8434e7";

const MapScreen = () => {
  const [restStops, setRestStops] = useState([]);

  useEffect(() => {
    fetchRestStops();
  }, []);

  const fetchRestStops = async () => {
    try {
      const response = await fetch("https://tulikartta.fi/api-json2.php");
      const data = await response.json();

      console.log("Raw API Response:", data);

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

      console.log("Filtered Rest Stops (Nuotiopaikka):", filteredStops);

      setRestStops(filteredStops);
    } catch (error) {
      console.error("Error fetching rest stops:", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: 60.2,
          longitude: 25.0,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <UrlTile 
        urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
        flipY={false}
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