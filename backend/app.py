import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone
from flask import Flask, jsonify, request
from supabase import create_client, Client
from dotenv import load_dotenv
from flask_cors import CORS
from improved_model import EnhancedDelayPredictor

# --- 1. SETUP & CONFIGURATION ---
load_dotenv()
app = Flask(__name__)

# --- START: CORS CONFIGURATION ---
# This is the line that fixes the browser error.
# It tells the server to accept requests from your Next.js frontend.
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
# --- END: CORS CONFIGURATION ---

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# --- 2. CORE SIMULATION LOGIC ---
class Train: # No changes here
    def __init__(self, train_id, schedule_data):
        self.id = train_id
        self.schedule = sorted([(s['station_name'], datetime.fromisoformat(s['scheduled_time'])) for s in schedule_data], key=lambda x: x[1])
        self.current_station_index = 0
        self.current_delay = 0
        self.status = 'ON_TIME'
    def get_current_location(self):
        return self.schedule[self.current_station_index][0]
    def update(self, current_time):
        if self.status == 'FINISHED': return
        scheduled_departure = self.schedule[self.current_station_index][1]
        actual_departure = scheduled_departure + timedelta(minutes=self.current_delay)
        if current_time >= actual_departure:
            if self.current_station_index < len(self.schedule) - 1: self.current_station_index += 1
            else: self.status = 'FINISHED'

class TrainSimulator: # No changes here
    def __init__(self):
        self.trains = {}
        self.current_time = datetime(2023, 10, 27, 8, 0, 0, tzinfo=timezone.utc)
        self._load_initial_state()
    def _load_initial_state(self):
        print("Loading initial train schedules from Supabase...")
        response = supabase.table('schedules').select('train_id, station_name, scheduled_time').execute()
        all_schedules = response.data
        train_ids = set(s['train_id'] for s in all_schedules)
        self.trains = {train_id: Train(train_id, [s for s in all_schedules if s['train_id'] == train_id]) for train_id in train_ids}
        print(f"Successfully loaded {len(self.trains)} trains.")
    def step(self, minutes=1):
        self.current_time += timedelta(minutes=minutes)
        for train in self.trains.values(): train.update(self.current_time)
    def add_delay_event(self, train_id, delay_minutes, cause="MANUAL"):
        if train_id in self.trains:
            self.trains[train_id].current_delay += delay_minutes
            self.trains[train_id].status = 'DELAYED'
            return True
        return False
    def get_state(self):
        """Creates a JSON-friendly snapshot of the current simulation state."""
        return {
            'currentTime': self.current_time.strftime('%Y-%m-%d %H:%M'),
            'trains': [{
                'id': t.id,
                'location': t.get_current_location(),
                'delay': t.current_delay,
                'status': t.status
            } for t in self.trains.values() if t.status != 'FINISHED']
        }


# --- 3. GLOBAL INSTANCES & ENHANCED MODEL LOADING ---
print("Initializing Train Simulator...")
simulator = TrainSimulator()

print("Loading ENHANCED delay prediction model...")
try:
    enhanced_predictor = joblib.load('enhanced_delay_model.pkl')
    if not enhanced_predictor.is_trained:
         raise Exception("Loaded model is not trained!")
    print("✅ Enhanced model loaded successfully.")
except FileNotFoundError:
    print("❌ FATAL: enhanced_delay_model.pkl not found. Please run train_enhanced_model.py first.")
    enhanced_predictor = None

# --- 4. ANALYSIS & RECOMMENDATION HELPERS ---
def calculate_cascade_impact(primary_train_id, primary_delay_minutes): # No changes here
    affected_trains = []
    primary_train = simulator.trains.get(primary_train_id)
    if not primary_train: return {'error': 'Train not found'}
    primary_future_stations = {s[0] for s in primary_train.schedule[primary_train.current_station_index:]}
    for other_train in simulator.trains.values():
        if other_train.id == primary_train_id: continue
        other_future_stations = {s[0] for s in other_train.schedule[other_train.current_station_index:]}
        if primary_future_stations.intersection(other_future_stations):
            additional_delay = int(primary_delay_minutes * np.random.uniform(0.3, 0.7))
            if additional_delay > 5: affected_trains.append({'id': other_train.id, 'additional_delay': additional_delay})
    return {'primary_train_id': primary_train_id, 'affected_count': len(affected_trains), 'total_impact_minutes': sum(t['additional_delay'] for t in affected_trains), 'affected_trains': affected_trains}

def generate_recommendations(cascade_analysis, risk_level="LOW"): # ENHANCED
    recommendations = []
    if risk_level == 'HIGH':
         recommendations.append({'id': 'REC-AI-CRITICAL', 'priority': 'Critical', 'action': "AI RISK ALERT: HIGH. Immediately consider rerouting express trains to mitigate major disruption.", 'confidence': 0.98})
    if cascade_analysis.get('total_impact_minutes', 0) > 60:
        recommendations.append({'id': 'REC-REROUTE', 'priority': 'High', 'action': f"Reroute a low-priority freight train to free up track for {cascade_analysis['primary_train_id']}.", 'confidence': 0.85})
    if cascade_analysis.get('affected_count', 0) > 3:
        recommendations.append({'id': 'REC-HOLD', 'priority': 'Medium', 'action': f"Hold an express train at the next major station for 15 mins to create a buffer.", 'confidence': 0.72})
    if not recommendations:
        recommendations.append({'id': 'REC-MONITOR', 'priority': 'Low', 'action': "Monitor network. Predicted impact is within acceptable parameters.", 'confidence': 0.95})
    return recommendations

# --- 5. API ENDPOINTS ---
@app.route('/simulation_state', methods=['GET'])
def get_simulation_state():
    simulator.step(minutes=5)
    # Convert your custom Train objects into a standard dictionary format
    train_list = []
    for train in simulator.trains.values():
        if train.status != 'FINISHED':
            train_list.append({
                'id': train.id,
                'current_station': train.get_current_location(),
                'next_station': train.schedule[train.current_station_index + 1][0] if train.current_station_index + 1 < len(train.schedule) else 'End of Line',
                'status': 'Delayed' if train.current_delay > 0 else 'On-Time',
                'delay_minutes': train.current_delay
            })
    
    state = {
        'currentTime': simulator.current_time.strftime('%Y-%m-%d %H:%M'),
        'trains': train_list
    }
    return jsonify(state)

@app.route('/kpis', methods=['GET'])
def get_kpis():
    trains = [t for t in simulator.trains.values() if t.status != 'FINISHED']
    total_trains = len(trains)
    if total_trains == 0:
        kpis = [
            {'id': 'on_time_percentage', 'title': 'On-Time Percentage', 'value': '100%', 'change': 'N/A'},
            {'id': 'average_delay', 'title': 'Average Delay', 'value': '0 min', 'change': 'N/A'},
            {'id': 'active_trains', 'title': 'Active Trains', 'value': '0', 'change': 'N/A'}
        ]
        return jsonify({'kpis': kpis})

    on_time_count = sum(1 for t in trains if t.status == 'ON_TIME')
    total_delay = sum(t.current_delay for t in trains)
    on_time_percentage = round((on_time_count / total_trains) * 100, 1)
    average_delay_minutes = round(total_delay / total_trains, 1)

    kpis = [
        {'id': 'on_time_percentage', 'title': 'On-Time Percentage', 'value': f'{on_time_percentage}%', 'change': '+0.5% from last hour'},
        {'id': 'average_delay', 'title': 'Average Delay', 'value': f'{average_delay_minutes} min', 'change': '-2% from last hour'},
        {'id': 'active_trains', 'title': 'Active Trains', 'value': str(total_trains), 'change': '+1 from last hour'}
    ]
    return jsonify({'kpis': kpis})

@app.route('/predict_delay', methods=['POST']) # COMPLETELY REPLACED
def predict_delay_enhanced():
    if not enhanced_predictor: return jsonify({'error': 'Model not loaded'}), 500
    data = request.get_json()
    train_id = data.get('train_id')
    train = simulator.trains.get(train_id)
    if not train: return jsonify({'error': 'Train not found'}), 404
    
    input_features = {
        'hour': simulator.current_time.hour,
        'day_of_week': simulator.current_time.weekday(),
        'priority': 1 if 'Express' in train.id else 2,
        'initial_delay': train.current_delay,
        'weather_severity': 8 if data.get('scenario') == 'weather_disruption' else 1,
        'congestion': len([t for t in simulator.trains.values() if t.status == 'DELAYED']) / len(simulator.trains)
    }
    prediction_result = enhanced_predictor.predict_with_explanation(input_features)
    # Manually add train_id to the response as required by the frontend
    prediction_result['train_id'] = train_id
    return jsonify(prediction_result)

@app.route('/analyze_impact', methods=['POST'])
def analyze_impact():
    data = request.get_json()
    impact_data = calculate_cascade_impact(data.get('train_id'), data.get('predicted_delay'))
    
    # Restructure the response to match the frontend's expected format
    response = {
        'primary_train': impact_data.get('primary_train_id'),
        'affected_train_count': impact_data.get('affected_count'),
        'total_delay_minutes': impact_data.get('total_impact_minutes'),
        'affected_trains': [
            {'train_id': t['id'], 'additional_delay': t['additional_delay']}
            for t in impact_data.get('affected_trains', [])
        ]
    }
    return jsonify(response)

@app.route('/get_recommendations', methods=['POST']) # ENHANCED
def get_recommendations_route():
    data = request.get_json()
    cascade_analysis = data.get('cascade_analysis')
    risk_level = data.get('risk_level')
    recs = generate_recommendations(cascade_analysis, risk_level)
    # Restructure the response to match the frontend's expected format
    response = {
        'recommendations': [
            {'priority': r['priority'], 'action': r['action'], 'confidence': r['confidence']}
            for r in recs
        ]
    }
    return jsonify(response)


# --- 6. DEMO CONTROL ENDPOINTS ---
@app.route('/reset_simulation', methods=['POST'])
def reset_simulation():
    global simulator
    simulator = TrainSimulator()
    return jsonify({'message': 'Simulation has been reset.'})

@app.route('/inject_scenario', methods=['POST']) # ENHANCED
def inject_scenario():
    data = request.get_json()
    scenario = data.get('scenario')
    global simulator
    simulator = TrainSimulator() # Reset before injecting for a clean start
    
    if scenario == 'single_breakdown':
        simulator.add_delay_event("T-105", 25, cause="Engine Failure on Express Train")
        simulator.add_delay_event("T-108", 5, cause="Congestion from T-105")
        return jsonify({'message': 'Scenario: A critical Express Train has broken down, causing immediate congestion.'})
    elif scenario == 'weather_disruption':
        simulator.add_delay_event("T-102", 15, cause="Low visibility (Fog)")
        simulator.add_delay_event("T-110", 20, cause="Low visibility (Fog)")
        simulator.add_delay_event("T-115", 10, cause="Low visibility (Fog)")
        simulator.add_delay_event("T-104", 12, cause="Low visibility (Fog)")
        return jsonify({'message': 'Scenario: A sudden weather crisis is causing widespread network disruption.'})
    
    return jsonify({'message': 'Normal operations restored.'})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render injects PORT, defaults to 5000 locally
    app.run(host="0.0.0.0", port=port, debug=False)
