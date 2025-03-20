import React, { useEffect, useState } from "react";
import MapView, { UrlTile, Polyline } from "react-native-maps";
import { View, StyleSheet } from "react-native";

const MapScreen = ({ navigation }) => {
  const [trails, setTrails] = useState([]);

  useEffect(() => {
    fetchTrails();
  }, []);

  const fetchTrails = async () => {
    const apiUrl = `https://avoin-paikkatieto.maanmittauslaitos.fi/maastotiedot/features/v1/collections/tieviiva/items?bbox=24.9,60.1,25.1,60.3&crs=http://www.opengis.net/def/crs/EPSG/0/3067&api-key=e6311845-2b5c-4e0f-babc-83539e8434e7`;
    
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const trailCoordinates = data.features.map((feature) => ({
        id: feature.id,
        coordinates: feature.geometry.coordinates.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        })),
      }));
      setTrails(trailCoordinates);
    } catch (error) {
      console.error("Error fetching trails:", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 60.2,
          longitude: 25.0,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* Add Topographic Map Tiles */}
        <UrlTile
          urlTemplate="https://avoin-karttakuva.maanmittauslaitos.fi/taustakartat/service/wmts?api-key=e6311845-2b5c-4e0f-babc-83539e8434e7"
          maximumZ={19}
        />

        {/* Draw Trails on the Map */}
        {trails.map((trail) => (
          <Polyline
            key={trail.id}
            coordinates={trail.coordinates}
            strokeWidth={3}
            strokeColor="green"
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default MapScreen;
