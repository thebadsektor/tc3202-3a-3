from django.urls import path
from .views import firebase_verify_login_token, firebase_verify_google_token

urlpatterns = [
    path('verify-login-token/', firebase_verify_login_token, name="firebase_verify_login_token"),
    path('verify-google-token/', firebase_verify_google_token, name='firebase_verify_google_token'),
]