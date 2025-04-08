# geminiApi/ml/feature_forecast.py

import pandas as pd
import numpy as np
import statsmodels.api as sm
import os
import warnings

warnings.filterwarnings("ignore")  # Optional: hide SARIMA warnings

def forecast_feature(series, periods=1):
    try:
        model = sm.tsa.SARIMAX(series, order=(1, 1, 1), seasonal_order=(0, 1, 1, 12), enforce_stationarity=False, enforce_invertibility=False)
        model_fit = model.fit(disp=False)
        forecast = model_fit.forecast(steps=periods)
        result = forecast.iloc[-1]
        return round(float(result), 4) if not pd.isna(result) else 0.0
    except Exception as e:
        print(f"[SARIMAX ERROR] {e}")
        return 0.0


def build_next_month_input():
    path = os.path.join("data", "enhanced_kWh_800_edited_records.csv")
    df = pd.read_csv(path)

    # Ensure no missing values in key columns
    df = df.dropna(subset=["Year", "Month", "Inflation Rate", "Generation Charge", "Avg_Temperature", "Total Bill"])

    df = df.sort_values(["Year", "Month"]).reset_index(drop=True)
    df["Date"] = pd.to_datetime(df["Year"].astype(str) + "-" + df["Month"].astype(str) + "-01")

    # Forecast next month's external features
    inflation_pred = forecast_feature(df["Inflation Rate"])
    gen_charge_pred = forecast_feature(df["Generation Charge"])
    temp_pred = forecast_feature(df["Avg_Temperature"])

    last_row = df.iloc[-1]
    lag1_bill = last_row["Total Bill"]
    lag1_gen = last_row["Generation Charge"]
    lag1_infl = last_row["Inflation Rate"]
    lag1_temp = last_row["Avg_Temperature"]

    roll3 = df.tail(3)
    bill_roll3 = roll3["Total Bill"].mean()
    gen_roll3 = roll3["Generation Charge"].mean()
    infl_roll3 = roll3["Inflation Rate"].mean()
    temp_roll3 = roll3["Avg_Temperature"].mean()

    next_month = (last_row["Month"] % 12) + 1
    next_year = last_row["Year"] + (1 if next_month == 1 else 0)

    return {
        "Month": next_month,
        "Inflation Rate": inflation_pred,
        "Generation Charge": gen_charge_pred,
        "Avg_Temperature": temp_pred,
        "Total_Bill_Lag1": lag1_bill,
        "Generation_Charge_Lag1": lag1_gen,
        "Inflation_Lag1": lag1_infl,
        "Avg_Temp_Lag1": lag1_temp,
        "Total_Bill_Rolling3": bill_roll3,
        "Gen_Charge_Rolling3": gen_roll3,
        "Inflation_Rolling3": infl_roll3,
        "Temp_Rolling3": temp_roll3,
        "Is_Hot_Season": int(next_month in [4, 5]),
        "Is_Cold_Season": int(next_month in [12, 1, 2])
    }
