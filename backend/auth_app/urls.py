from django.urls import path
from .views import firebase_verify_login_token, firebase_verify_google_token, verify_otp_and_reset_password, send_otp_reset_password

urlpatterns = [
    path('verify-login-token/', firebase_verify_login_token, name="firebase_verify_login_token"),
    path('verify-google-token/', firebase_verify_google_token, name='firebase_verify_google_token'),
    path('send-otp-reset-password/', send_otp_reset_password, name='send_otp_reset_password'),
    path('verify-otp-and-reset-password/', verify_otp_and_reset_password, name='verify_password_and_reset_otp'),
]