import pandas as pd
from prophet import Prophet
from datetime import datetime, timedelta
from typing import Dict, Any

def generate_historical_data(base_date: datetime, days: int = 90) -> pd.DataFrame:
    """
    Since we don't have 3 months of data in our fresh database, 
    we dynamically generate realistic historical time-series data to train the model.
    """
    dates = [base_date - timedelta(days=x) for x in range(days)]
    
    # Generate realistic footfall with a weekly seasonality (weekends lower)
    # and a recent upward trend (to give the model something to catch)
    data = []
    for d in dates:
        base_footfall = 50
        # Lower on weekends (Saturday=5, Sunday=6)
        if d.weekday() >= 5:
             base_footfall = 20
             
        # Add a recent spike in the last 7 days to trigger the ML trend
        if (base_date - d).days < 7:
             base_footfall += 30 
             
        data.append({"ds": d, "y": base_footfall})
        
    df = pd.DataFrame(data)
    # Prophet requires dates to be sorted oldest to newest
    df = df.sort_values(by="ds").reset_index(drop=True) 
    return df

def run_prophet_forecast(df: pd.DataFrame, periods: int = 7) -> pd.DataFrame:
    """
    Trains a REAL Prophet ML model on the dataframe and predicts the future.
    """
    # 1. Initialize the Prophet Model
    # We tell it to look for weekly seasonality (which is standard for clinics)
    model = Prophet(yearly_seasonality=False, daily_seasonality=False, weekly_seasonality=True)
    
    # 2. Train the model
    model.fit(df)
    
    # 3. Create a dataframe for the future dates
    future = model.make_future_dataframe(periods=periods)
    
    # 4. Predict!
    forecast = model.predict(future)
    
    # Return only the future predictions
    return forecast.tail(periods)

def generate_7_day_forecast(facility_id: str) -> Dict[str, Any]:
    """
    The main endpoint logic using real ML.
    """
    # 1. Get the current date
    today = datetime.now()
    
    # 2. Get the historical data (Mocked here for 90 days, but formatted as a real DB pull)
    df_history = generate_historical_data(today, days=90)
    
    # 3. Run the ML Model
    try:
        forecast_df = run_prophet_forecast(df_history, periods=7)
    except Exception as e:
        return {"error": f"ML Model failed to run: {str(e)}"}
    
    # 4. Extract the mathematical predictions
    # Prophet gives us 'yhat' (the prediction), 'yhat_lower' (pessimistic), and 'yhat_upper' (optimistic)
    daily_predictions = []
    total_expected_footfall = 0
    
    for _, row in forecast_df.iterrows():
        pred = int(max(0, row['yhat'])) # Ensure no negative footfall
        total_expected_footfall += pred
        
        daily_predictions.append({
            "date": row['ds'].strftime('%Y-%m-%d'),
            "predicted_footfall": pred,
            "confidence_lower": int(max(0, row['yhat_lower'])),
            "confidence_upper": int(max(0, row['yhat_upper']))
        })
        
    # 5. Convert ML Footfall -> Medicine Demand (Using simple ratios for now)
    # In a full production system, we would run a separate Prophet model for *each* medicine
    medicine_demand = {
        "Paracetamol": int(total_expected_footfall * 0.6),
        "ORS": int(total_expected_footfall * 0.2),
        "Amoxicillin": int(total_expected_footfall * 0.15)
    }

    return {
        "facility_id": facility_id,
        "forecast_period_days": 7,
        "generated_at": datetime.utcnow().isoformat(),
        "ml_model_used": "Facebook Prophet (Time-Series)",
        "predictions": {
            "total_7_day_expected_footfall": total_expected_footfall,
            "daily_breakdown": daily_predictions
        },
        "medicine_demand_forecast": medicine_demand
    }