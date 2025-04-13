from flask_cors import CORS
from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)
CORS(app)

ORS_API_KEY = os.environ.get("ORS_API_KEY")

@app.route("/get_route", methods=["POST"])
def get_route():
    data = request.json
    waypoints = data.get("waypoints", [])

    if len(waypoints) < 2:
        return jsonify({"error": "Need at least 2 points"}), 400
    
    coordinates = [[wp["longitude"], wp["latitude"]] for wp in waypoints]

    url = "https://api.openrouteservice.org/v2/directions/foot-walking/geojson"
    headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}
    payload = {"coordinates": coordinates}

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Route request failed", "details": response.text}), 500
    