import { saveRoute } from "../firebase/firestore";
import { auth } from "../firebase/firebaseConfig";

const handleSaveRoute = async () => {
  const userId = auth.currentUser.uid;
  const routeData = {
    name: "Mountain Trail",
    averageSpeed: 5.2,
    time: 3600, // seconds
    length: 12000, // meters
    date: new Date(),
    coordinates: [
      { lat: 40.7128, lng: -74.0060 },
      { lat: 40.7138, lng: -74.0070 }
    ]
  };

  try {
    const docId = await saveRoute(userId, routeData);
    console.log("Route saved with ID:", docId);
  } catch (error) {
    console.error("Failed to save route:", error);
  }
};

export default handleSaveRoute;