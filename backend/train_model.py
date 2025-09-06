# backend/train_model.py
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
from supabase import create_client, Client
from dotenv import load_dotenv

def train_and_save_model():
    load_dotenv()
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_KEY")
    supabase: Client = create_client(url, key)

    print("Fetching delay data from Supabase for training...")
    response = supabase.table('delays').select('*').execute()
    df = pd.DataFrame(response.data)
    
    # Feature Engineering
    df['recorded_at'] = pd.to_datetime(df['recorded_at'])
    df['hour_of_day'] = df['recorded_at'].dt.hour
    df['day_of_week'] = df['recorded_at'].dt.dayofweek
    df['initial_delay'] = [max(0, d-10) for d in df['delay_minutes']]

    features = ['hour_of_day', 'day_of_week', 'initial_delay', 'weather_condition']
    target = 'delay_minutes'
    X = df[features]
    y = df[target]

    categorical_features = ['weather_condition']
    numeric_features = ['hour_of_day', 'day_of_week', 'initial_delay']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)])

    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    model_pipeline.fit(X, y)
    joblib.dump(model_pipeline, 'delay_model.pkl')
    print("Model trained and saved as delay_model.pkl")

if __name__ == '__main__':
    train_and_save_model()