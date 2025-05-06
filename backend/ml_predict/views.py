from django.shortcuts import render
# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .ml.feature_forecast import build_next_month_input
import json
import pandas as pd
import numpy as np
import os
import joblib
import threading
import time
from gradio_client import Client


huggingface_lock = threading.Lock()

@csrf_exempt
def get_energy_recommendation(request):
    if request.method == "POST":
        if huggingface_lock.locked():
            return JsonResponse(
                {"error": "Model is currently processing another request. Please wait and try again."},
                status=429  # Too Many Requests
            )

        try:
            data = json.loads(request.body)
            user_input = data.get("appliance_info", "")
            prompt = user_input
            with huggingface_lock:
                client = Client("Wh1plashR/AppTry")
                result = client.predict(appliance_info=prompt, api_name="/predict")
                return JsonResponse({"recommendation": result})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "POST request required."}, status=400)

model_path = os.path.join("models", "xgb_total_bill_model_tuned.pkl")
model = joblib.load(model_path)
@csrf_exempt
def predict_total_bill(request):
    try:
        input_data = build_next_month_input()
        print("INPUT DATA:", input_data)  # Debug log
        df = pd.DataFrame([input_data])
        print("DATAFRAME FOR PREDICTION:\n", df)  # Debug log
        prediction = model.predict(df)[0]
        return JsonResponse({
    "prediction": round(float(prediction), 4),  # Ensure it's a native Python float
    "input_used": {k: float(v) if isinstance(v, (np.float32, np.float64)) else int(v) if isinstance(v, (np.int32, np.int64)) else v for k, v in input_data.items()}
})

    except Exception as e:
        print("PREDICTION ERROR:", e)  # Show traceback in console
        return JsonResponse({"error": str(e)}, status=500)
