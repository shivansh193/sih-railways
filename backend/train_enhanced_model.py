import os
import pandas as pd
from datetime import datetime
import joblib
from supabase import create_client, Client
from dotenv import load_dotenv
from improved_model import EnhancedDelayPredictor

def run_training():
    load_dotenv()
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_KEY")
    supabase: Client = create_client(url, key)

    print("Fetching delay data from Supabase for enhanced training...")
    response = supabase.table('delays').select('*').execute()
    df = pd.DataFrame(response.data)
    df['recorded_at'] = pd.to_datetime(df['recorded_at'])
    print(f"Fetched {len(df)} records.")

    # Transform DataFrame into the required training format
    training_data = []
    for _, row in df.iterrows():
        # Create a simplified feature set from the raw data for training
        features = {
            'hour': row['recorded_at'].hour,
            'day_of_week': row['recorded_at'].weekday(),
            'priority': 1 if 'Express' in row['train_id'] else 2, # Example priority
            'initial_delay': max(0, row['delay_minutes'] - np.random.randint(5,15)),
            'weather_severity': 8 if row['weather_condition'] == 'Foggy' else 4 if row['weather_condition'] == 'Rainy' else 1,
            'congestion': np.random.uniform(0.2, 0.8) # Simulate congestion
        }
        training_data.append({
            'features': features,
            'delay_minutes': row['delay_minutes']
        })

    # Instantiate and train the model
    predictor = EnhancedDelayPredictor()
    predictor.train(training_data)

    # Save the entire trained model object
    joblib.dump(predictor, 'enhanced_delay_model.pkl')
    print("\n✅ Enhanced model has been trained and saved as 'enhanced_delay_model.pkl'")

if __name__ == '__main__':
    import numpy as np
    run_training()