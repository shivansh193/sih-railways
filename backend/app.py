# ==============================================================================
# Rail-Forecast Core MVP: Main Application Server
# This single file contains all the backend logic for the 12-hour demo.
# ==============================================================================

import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone
from flask import Flask, jsonify, request
from supabase import create_client, Client
from dotenv import load_dotenv

# --- 1. SETUP & CONFIGURATION ---
# Load environment variables from .env file
load_dotenv()

# Initialize Flask App
app = Flask(__name__)

# Initialize Supabase Client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
if not url or not key:
    raise ValueError("Supabase URL and Key must be set in the .env file.")
supabase: Client = create_client(url, key)


# --- 2. CORE SIMULATION LOGIC (CLASSES) ---
# Represents a single train in our simulation.
class Train:
    def __init__(self, train_id, schedule_data):
        self.id = train_id
        # Schedule data from Supabase needs to be parsed and sorted
        self.schedule = sorted(
            [(s['station_name'], datetime.fromisoformat(s['scheduled_time'])) for s in schedule_data],
            key=lambda x: x[1]
        )
        self.current_station_index = 0
        self.current_delay = 0
        self.status = 'ON_TIME'

    def get_current_location(self):
        return self.schedule[self.current_station_index][0]

    def update(self, current_time):
        if self.status == 'FINISHED':
            return
        
        scheduled_departure = self.schedule[self.current_station_index][1]
        actual_departure = scheduled_departure + timedelta(minutes=self.current_delay)

        # If the current time has passed our actual departure time, move to the next station.
        if current_time >= actual_departure:
            if self.current_station_index < len(self.schedule) - 1:
                self.current_station_index += 1
            else:
                self.status = 'FINISHED'

# Manages the entire state of the railway network in-memory.
class TrainSimulator:
    def __init__(self):
        self.trains = {}  # Using a dictionary for fast train lookups by ID
        self.current_time = datetime(2023, 10, 27, 8, 0, 0, tzinfo=timezone.utc) # Fixed start time for consistent demos
        self._load_initial_state()

    def _load_initial_state(self):
        print("Loading initial train schedules from Supabase...")
        try:
            response = supabase.table('schedules').select('train_id, station_name, scheduled_time').execute()
            all_schedules = response.data
            train_ids = set(s['train_id'] for s in all_schedules)

            self.trains = {}
            for train_id in train_ids:
                schedule_for_train = [s for s in all_schedules if s['train_id'] == train_id]
                self.trains[train_id] = Train(train_id, schedule_for_train)
            print(f"Successfully loaded {len(self.trains)} trains into the simulator.")
        except Exception as e:
            print(f"FATAL: Could not load data from Supabase. Error: {e}")
            self.trains = {}

    def step(self, minutes=1):
        self.current_time += timedelta(minutes=minutes)
        for train in self.trains.values():
            train.update(self.current_time)
    
    def add_delay_event(self, train_id, delay_minutes, cause="MANUAL"):
        if train_id in self.trains:
            self.trains[train_id].current_delay += delay_minutes
            self.trains[train_id].status = 'DELAYED'
            print(f"Injected delay of {delay_minutes} mins to {train_id} due to {cause}.")
            return True
        return False

    def get_state(self):
        return {
            'currentTime': self.current_time.strftime('%Y-%m-%d %H:%M'),
            'trains': [{
                'id': t.id,
                'location': t.get_current_location(),
                'delay': t.current_delay,
                'status': t.status
            } for t in self.trains.values() if t.status != 'FINISHED']
        }

# --- 3. GLOBAL INSTANCES & MODEL LOADING ---
# The single, live instance of our simulator for the entire application.
print("Initializing Train Simulator...")
simulator = TrainSimulator()

# Load the pre-trained machine learning model once at startup.
print("Loading delay prediction model...")
try:
    delay_predictor = joblib.load('delay_model.pkl')
    print("Model loaded successfully.")
except FileNotFoundError:
    print("FATAL: delay_model.pkl not found. Please run train_model.py first.")
    delay_predictor = None


# --- 4. HELPER FUNCTIONS for Analysis & Recommendations ---
# Calculates the ripple effect of a single delay across the network.
def calculate_cascade_impact(primary_train_id, primary_delay_minutes):
    affected_trains = []
    primary_train = simulator.trains.get(primary_train_id)
    if not primary_train: return {'error': 'Train not found'}

    primary_future_stations = {s[0] for s in primary_train.schedule[primary_train.current_station_index:]}

    for other_train in simulator.trains.values():
        if other_train.id == primary_train_id: continue
        
        other_future_stations = {s[0] for s in other_train.schedule[other_train.current_station_index:]}
        shared_stations = primary_future_stations.intersection(other_future_stations)
        
        if shared_stations:
            # Simple demo heuristic: a train behind on a shared track gets a fraction of the delay.
            additional_delay = int(primary_delay_minutes * np.random.uniform(0.3, 0.7))
            if additional_delay > 5:
                affected_trains.append({
                    'id': other_train.id, 
                    'additional_delay': additional_delay,
                    'reason': f'Track conflict with {primary_train_id} at {list(shared_stations)[0]}'
                })

    total_network_impact = sum(t['additional_delay'] for t in affected_trains)
    return {
        'primary_train_id': primary_train_id, 'primary_delay': primary_delay_minutes,
        'affected_count': len(affected_trains), 'total_impact_minutes': total_network_impact,
        'affected_trains': affected_trains
    }

# Generates strategic advice based on the cascade analysis.
def generate_recommendations(cascade_analysis):
    recommendations = []
    total_impact = cascade_analysis.get('total_impact_minutes', 0)
    affected_count = cascade_analysis.get('affected_count', 0)

    if total_impact > 60:
        recommendations.append({
            'id': 'REC-HIGH-01', 'priority': 'High',
            'action': f"Reroute a low-priority freight train to free up track for {cascade_analysis['primary_train_id']}.",
            'impact_reduction': f"~{int(total_impact * 0.4)} minutes saved network-wide", 'confidence': 0.85
        })
    if affected_count > 3:
        recommendations.append({
            'id': 'REC-MED-01', 'priority': 'Medium',
            'action': f"Hold an express train at the next major station for 15 mins to create a safe buffer.",
            'impact_reduction': f"Prevents cascading delays for {affected_count - 1} other trains.", 'confidence': 0.72
        })
    if not recommendations:
        recommendations.append({
            'id': 'REC-LOW-01', 'priority': 'Low',
            'action': "Monitor network. Current predicted impact is within acceptable parameters.",
            'impact_reduction': "N/A", 'confidence': 0.95
        })
    return recommendations


# --- 5. API ENDPOINTS ---

# Endpoint for the frontend to get the current state of all trains.
@app.route('/simulation_state', methods=['GET'])
def get_simulation_state():
    simulator.step(minutes=5) # Auto-step the simulation for a dynamic demo
    return jsonify(simulator.get_state())

# Endpoint to predict the future delay of a single train.
@app.route('/predict_delay', methods=['POST'])
def predict_delay():
    if not delay_predictor: return jsonify({'error': 'Model not loaded'}), 500
    
    data = request.get_json() # Expected: { "initial_delay": 15, "weather_condition": "Foggy" }
    current_time = simulator.current_time
    input_data = {
        "hour_of_day": current_time.hour, "day_of_week": current_time.weekday(),
        "initial_delay": data.get("initial_delay", 0), "weather_condition": data.get("weather_condition", "Clear")
    }
    
    input_df = pd.DataFrame([input_data])
    prediction = delay_predictor.predict(input_df)
    additional_delay = prediction[0] - input_data['initial_delay']
    
    return jsonify({'predicted_additional_delay': round(max(0, additional_delay), 2)})

# Endpoint to analyze the network-wide impact of a predicted delay.
@app.route('/analyze_impact', methods=['POST'])
def analyze_impact():
    data = request.get_json() # Expected: { "train_id": "T-105", "predicted_delay": 45 }
    impact = calculate_cascade_impact(data.get('train_id'), data.get('predicted_delay'))
    return jsonify(impact)

# Endpoint to get actionable recommendations based on the impact analysis.
@app.route('/get_recommendations', methods=['POST'])
def get_recommendations():
    cascade_analysis = request.get_json()
    recs = generate_recommendations(cascade_analysis)
    return jsonify(recs)

# --- 6. DEMO CONTROL ENDPOINTS ---

# Endpoint to reset the entire simulation to its starting state.
@app.route('/reset_simulation', methods=['POST'])
def reset_simulation():
    global simulator
    simulator = TrainSimulator()
    return jsonify({'message': 'Simulation has been reset to its initial state.'})

# Endpoint to inject pre-defined scenarios for the demo narrative.
@app.route('/inject_scenario', methods=['POST'])
def inject_scenario():
    data = request.get_json() # Expected: { "scenario": "single_breakdown" | "weather_disruption" }
    scenario = data.get('scenario')
    
    if scenario == 'single_breakdown':
        simulator.add_delay_event("T-105", 25, cause="Engine Failure")
        return jsonify({'message': 'Scenario injected: Train T-105 has broken down.'})
    elif scenario == 'weather_disruption':
        simulator.add_delay_event("T-102", 15, cause="Weather")
        simulator.add_delay_event("T-110", 20, cause="Weather")
        return jsonify({'message': 'Scenario injected: Foggy conditions causing multiple delays.'})
    
    return jsonify({'error': 'Unknown scenario'}), 400


# --- 7. MAIN EXECUTION BLOCK ---
if __name__ == '__main__':
    # Use a non-standard port to avoid conflicts with other common apps (like React's default 3000)
    app.run(debug=True, port=5001)