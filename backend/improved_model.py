import xgboost as xgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
import numpy as np
import joblib

class EnhancedDelayPredictor:
    def __init__(self):
        self.models = {}
        self.feature_names = []
        self.is_trained = False
        self.model_weights = {}

    def create_advanced_features(self, basic_features):
        """Create railway-specific features from a dictionary of basic inputs."""
        hour = basic_features.get('hour', 0)
        day = basic_features.get('day_of_week', 0)
        initial_delay = basic_features.get('initial_delay', 0)
        weather_severity = basic_features.get('weather_severity', 0)
        congestion = basic_features.get('congestion', 0.5)

        features = {
            'hour_of_day': hour,
            'is_peak_hour': 1 if hour in [7, 8, 9, 17, 18, 19] else 0,
            'day_of_week': day,
            'is_weekend': 1 if day >= 5 else 0,
            'train_priority': basic_features.get('priority', 2),
            'initial_delay': initial_delay,
            'weather_severity': weather_severity,
            'network_congestion': congestion,
            'delay_hour_interaction': initial_delay * hour,
            'weather_congestion_interaction': weather_severity * congestion
        }
        return list(features.values()), list(features.keys())

    def train(self, training_data):
        """Train an ensemble of models on historical data."""
        print("Starting enhanced model training...")
        X, y = [], []
        for record in training_data:
            features, names = self.create_advanced_features(record['features'])
            X.append(features)
            y.append(record['delay_minutes'])

        X = np.array(X)
        y = np.array(y)
        self.feature_names = names
        
        self.models = {
            'xgb': xgb.XGBRegressor(n_estimators=50, max_depth=4, random_state=42),
            'rf': RandomForestRegressor(n_estimators=30, max_depth=6, random_state=42),
            'lr': LinearRegression()
        }
        
        for name, model in self.models.items():
            print(f"Training {name} model...")
            model.fit(X, y)
        
        self.model_weights = self._calculate_weights(X, y)
        self.is_trained = True
        print("Enhanced model training complete.")

    def predict_with_explanation(self, input_features):
        """Predict delay with confidence, a breakdown, and a human-readable explanation."""
        if not self.is_trained:
            raise Exception("Model is not trained. Please run the training script.")
        
        features, _ = self.create_advanced_features(input_features)
        features_arr = np.array(features).reshape(1, -1)
        
        predictions = {}
        for name, model in self.models.items():
            # After (in improved_model.py):
            pred_numpy = model.predict(features_arr)[0]
            predictions[name] = float(round(pred_numpy, 2))
        
        final_prediction = sum(self.model_weights[name] * pred for name, pred in predictions.items())
        
        pred_std = np.std(list(predictions.values()))
        confidence = max(0.5, 1 - (pred_std / (abs(final_prediction) + 1e-6))) # +1e-6 to avoid division by zero
        
        explanation, risk_level = self._generate_explanation_and_risk(input_features, final_prediction)
        
        return {
            'predicted_delay_minutes': max(0, round(final_prediction, 2)),
            'confidence_score': round(min(confidence, 0.99), 2),
            'model_breakdown': predictions,
            'explanation': explanation,
            'risk_level': risk_level
        }

    def _calculate_weights(self, X, y):
        # For a hackathon, equal weighting is robust and fast.
        # A production system would use cross-validation to find optimal weights.
        print("Calculating model weights (using equal weighting for demo)...")
        num_models = len(self.models)
        return {name: 1.0 / num_models for name in self.models.keys()}

    def _generate_explanation_and_risk(self, input_features, final_prediction):
        """Generate a human-readable explanation of the prediction and assess risk."""
        explanations = []
        if input_features.get('initial_delay', 0) > 15:
            explanations.append(f"High initial delay ({input_features['initial_delay']} min) is a major factor.")
        if input_features.get('weather_severity', 0) > 5:
            explanations.append("Severe weather conditions are worsening the outlook.")
        if input_features.get('is_peak_hour', 0) == 1:
            explanations.append("Peak hour traffic is contributing to congestion.")
        if input_features.get('congestion', 0) > 0.7:
            explanations.append("High overall network congestion is amplifying delays.")
        
        if not explanations:
            explanations.append("Prediction based on standard operational patterns.")
            
        risk_level = 'HIGH' if final_prediction > 30 else 'MEDIUM' if final_prediction > 10 else 'LOW'
        return explanations, risk_level