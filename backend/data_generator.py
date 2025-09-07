# backend/data_generator.py
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('.env') # Load .env file from parent directory

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

STATIONS = ['Delhi', 'Palwal', 'Kosi Kalan', 'Mathura', 'Raja Ki Mandi', 'Agra']
CAUSES = ['Signal Failure', 'Weather', 'Congestion', 'Maintenance']
WEATHER = ['Clear', 'Rainy', 'Foggy']

def generate_and_upload():
    # --- Generate Schedules Data ---
    schedules = []
    for i in range(20):
        train_id = f"T-{100+i}"
        start_time = datetime(2023, 10, 27, np.random.randint(5, 22), np.random.randint(0, 59))
        for j, station in enumerate(STATIONS):
            schedules.append({
                'train_id': train_id, 
                'station_name': station, 
                'scheduled_time': (start_time + timedelta(minutes=j*45)).isoformat()
            })
    
    # --- Generate Delays Data ---
    delays = []
    for _ in range(1200):
        train_id = f"T-{100+np.random.randint(0, 20)}"
        recorded_at = datetime(2023, 10, 27, np.random.randint(0, 23), np.random.randint(0, 59))
        weather = np.random.choice(WEATHER, p=[0.7, 0.2, 0.1])
        cause = np.random.choice(CAUSES, p=[0.2, 0.3, 0.4, 0.1])
        base_delay = np.random.randint(5, 30)
        if weather == 'Foggy': base_delay *= 2
        if cause == 'Signal Failure': base_delay += 20
        delays.append({
            'train_id': train_id, 
            'delay_minutes': int(base_delay), 
            'recorded_at': recorded_at.isoformat(), 
            'cause': cause, 
            'weather_condition': weather
        })

    # --- Upload to Supabase ---
    print("Uploading schedules to Supabase...")
    # Supabase client prefers a list of dicts.
    supabase.table('schedules').insert(schedules).execute()

    print("Uploading delays to Supabase...")
    # For large uploads, it's better to chunk, but for 1200 records this is fine.
    supabase.table('delays').insert(delays).execute()

    print("Synthetic data uploaded successfully.")

if __name__ == '__main__':
    generate_and_upload()