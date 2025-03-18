import os
import json
import firebase_admin
from firebase_admin import credentials, db

if not firebase_admin._apps:  # Prevent re-initialization
    cred = credentials.Certificate('firebase-service-account.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://seconsumptiontracker-d337e-default-rtdb.firebaseio.com/'
    }) 
