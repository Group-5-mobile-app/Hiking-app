import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from "react-native-maps";
import xml2js from "react-native-xml2js";

const API_KEY = "e6311845-2b5c-4e0f-babc-83539e8434e7";
const CAPABILITIES_URL = "https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts/1.0.0/WMTSCapabilities.xml";

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
  /*const [tileUrl, setTileUrl] = useState(null);

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const response = await fetch(CAPABILITIES_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        console.log("XML response: ", text); // Debug log
        if (!text || text.trim() === "") {
          throw new Error("Empty response from server");
        }

        // Parse XML using xml2js
        xml2js.parseString(text, (err, result) => {
          if (err) {
            console.error("XML Parsing Error:", err);
            return;
          }
        
          console.log("Parsed XML:", result); // Debugging line

          if (!result || !result.Capabilities) {
            console.error("Invalid XML structure:", result);
            return;
          }

          // Find "maastokartta" layer
          const layers = result.Capabilities.Contents[0].Layer;
          let tileTemplate = null;

          layers.forEach((layer) => {
            const id = layer["ows:Identifier"][0];
            if (id === "maastokartta") {
              const resourceUrls = layer.ResourceURL;
              resourceUrls.forEach((resource) => {
                if (resource.$.format === "image/png") {
                  tileTemplate = resource.$.template;
                }
              });
            }
          });

          if (!tileTemplate) {
            console.error("No PNG tile URL found.");
            return;
          }

          // Replace placeholders with MapView-compatible variables
          let finalUrl = tileTemplate
            .replace("{TileMatrixSet}", "WGS84_Pseudo-Mercator")
            .replace("{TileMatrix}", "{z}")
            .replace("{TileRow}", "{y}")
            .replace("{TileCol}", "{x}");

          // Append API key
          finalUrl += `?api-key=${API_KEY}`;

          setTileUrl(finalUrl);
        });
      } catch (error) {
        console.error("Error fetching WMTS capabilities:", error);
      }
    };

    fetchCapabilities();
  }, []);*/

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