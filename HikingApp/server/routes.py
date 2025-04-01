from firebase import firestore

db = firestore.client()

routes = [
    {
        "name": "",
        "waypoints": [{"latitude":60.0, "longitude": 25.0}, {"latitude":60.2, "longitude": 25.2}],
        "path": [{"latitude": 60.15, "longitude": 25.15}, {"latitude": 60.18, "longitude": 25.18}],
    },
]

for route in routes: 
    db.collection("routes").add(route)
print("Routes uploaded")