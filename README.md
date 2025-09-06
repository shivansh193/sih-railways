## 📖 API Documentation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/railforecast-core.git
    cd railforecast-core
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r backend/requirements.txt
    ```

4.  **Configure Environment Variables:**
    - Create a file named `.env` inside the `backend/` directory.
    - Add your Supabase project credentials to this file:
      ```env
      SUPABASE_URL="YOUR_SUPABASE_URL_HERE"
      SUPABASE_KEY="YOUR_SUPABASE_ANON_KEY_HERE"
      ```

### 3. One-Time Initialization

These scripts need to be run only once to populate the database and train the ML model.

1.  **Seed the Database:** This script will connect to Supabase, create the necessary tables, and populate them with synthetic data.
    ```bash
    # From the backend/ directory
    python data_generator.py
    ```

2.  **Train the ML Model:** This script fetches the data from Supabase, trains a delay prediction model, and saves it as `delay_model.pkl`.
    ```bash
    # From the backend/ directory
    python train_model.py
    ```

### 4. Run the Server

Start the Flask development server. The API will be available at `http://127.0.0.1:5001`.
```bash
# From the backend/ directory
python app.py
```


### API Endpoint Summary

| Method | Endpoint Path           | Description                                    |
| :----- | :---------------------- | :--------------------------------------------- |
| `GET`  | `/simulation_state`     | Get the real-time state of all trains.         |
| `POST` | `/inject_scenario`      | Trigger a pre-defined demo problem.            |
| `POST` | `/predict_delay`        | Predict future delays using the ML model.      |
| `POST` | `/analyze_impact`       | Calculate the network-wide cascade effect.     |
| `POST` | `/get_recommendations`  | Generate strategic actions to mitigate delays. |
| `POST` | `/reset_simulation`     | Reset the demo to its starting state.          |

### API Endpoint Details

#### 1. Get Simulation State

The heartbeat of the application. Provides a real-time snapshot of the railway network.

-   **Endpoint:** `GET /simulation_state`
-   **Description:** Fetches the current simulation time and the status of all active trains. Advances the simulation clock by 5 minutes on each call.
-   **`curl` Command:**
    ```bash
    curl http://127.0.0.1:5001/simulation_state
    ```

#### 2. Inject Demo Scenario

A "God Mode" endpoint to trigger pre-defined problems for the demo narrative.

-   **Endpoint:** `POST /inject_scenario`
-   **Description:** Injects a hardcoded event into the simulation.
-   **`curl` Command (Single Breakdown):**
    ```bash
    curl -X POST -H "Content-Type: application/json" \
      -d '{"scenario": "single_breakdown"}' \
      http://127.0.0.1:5001/inject_scenario
    ```
-   **`curl` Command (Weather Disruption):**
    ```bash
    curl -X POST -H "Content-Type: application/json" \
      -d '{"scenario": "weather_disruption"}' \
      http://127.0.0.1:5001/inject_scenario
    ```

#### 3. Predict Future Delay

Showcases the core ML capability by predicting the future delay of a train.

-   **Endpoint:** `POST /predict_delay`
-   **Description:** Takes a train's current known delay and predicts the *additional* delay it will accumulate.
-   **`curl` Command:**
    ```bash
    curl -X POST -H "Content-Type: application/json" \
      -d '{"initial_delay": 25, "weather_condition": "Clear"}' \
      http://127.0.0.1:5001/predict_delay
    ```

#### 4. Analyze Network Impact

Calculates the cascade (ripple) effect of a single delay across the entire network.

-   **Endpoint:** `POST /analyze_impact`
-   **Description:** Takes a primary train's ID and its total predicted delay to find all other affected trains.
-   **`curl` Command:**
    ```bash
    curl -X POST -H "Content-Type: application/json" \
      -d '{"train_id": "T-105", "predicted_delay": 46}' \
      http://127.0.0.1:5001/analyze_impact
    ```

#### 5. Get Strategic Recommendations

Transforms the impact analysis into actionable advice for the operator.

-   **Endpoint:** `POST /get_recommendations`
-   **Description:** Generates mitigation strategies based on the output of the impact analysis.
-   **`curl` Command:**
    ```bash
    # Note: The body for this request should be the full JSON output from the /analyze_impact endpoint.
    # This is an example of what that body would look like.
    curl -X POST -H "Content-Type: application/json" \
      -d '{
            "primary_train_id": "T-105",
            "primary_delay": 46,
            "affected_count": 3,
            "total_impact_minutes": 55,
            "affected_trains": [
                { "id": "T-108", "additional_delay": 22, "reason": "Track conflict" }
            ]
          }' \
      http://127.0.0.1:5001/get_recommendations
    ```

#### 6. Reset Simulation

A utility endpoint to reset the simulation back to its initial state. Essential for running clean demos.

-   **Endpoint:** `POST /reset_simulation`
-   **Description:** Clears all injected delays and resets the simulation clock to the start time.
-   **`curl` Command:**
    ```bash
    curl -X POST http://127.0.0.1:5001/reset_simulation
    ```
