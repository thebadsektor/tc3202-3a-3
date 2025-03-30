import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import firebase_admin
from firebase_admin import auth
from firebase import firebase_admin
import random
import string
import datetime
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.db import models
from .models import PasswordResetOTP

@csrf_exempt
def firebase_verify_login_token(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=400)

    try:
        data = json.loads(request.body)
        id_token = data.get("id_token")  # Ensure it's "id_token" not "idToken"

        if not id_token:
            return JsonResponse({"error": "ID token is required."}, status=400)

        try:
            decoded_token = auth.verify_id_token(id_token, check_revoked=True, clock_skew_seconds=10)
            uid = decoded_token["uid"]

            return JsonResponse({"success": True, "uid": uid, "message": "Login successful"})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=401)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format."}, status=400)
    
@csrf_exempt
def firebase_verify_google_token(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=400)

    try:
        data = json.loads(request.body)
        id_token = data.get("id_token")

        if not id_token:
            return JsonResponse({"error": "ID token is required."}, status=400)

        try:
            decoded_token = auth.verify_id_token(id_token, check_revoked=True, clock_skew_seconds=10)
            uid = decoded_token["uid"]
            email = decoded_token.get("email", "")

            return JsonResponse({
                "success": True,
                "uid": uid,
                "email": email,
                "message": "Google Sign-In verified successfully"
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=401)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format."}, status=400)
    
# for smtp service
def generate_otp():
    # Generate a 6-digit OTP.
    return ''.join(random.choices(string.digits, k=6))

# send password reset OTP to email
@csrf_exempt
def send_otp_reset_password(request):
    if request.method != "POST":
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'})
    
    # check if the user is exists in the firebase realtime database
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        if not email:
            return JsonResponse({'success': False, 'error': 'Email is required'})
        
        try: 
            user = auth.get_user_by_email(email)
        except:
            # Don't reveal if email exists or not for security
            return JsonResponse({'success': True, 'message': 'If your email exists, an OTP has been sent'})
        
        # generate a nd store OTP
        otp = generate_otp()
        
        # delete any existing unused OTP for the user
        PasswordResetOTP.objects.filter(email=email, is_used=False).delete()
        
        # create a new OTP entry
        PasswordResetOTP.objects.create(email=email, otp=otp)
        
        # send OTP to email
        subject = 'Password Reset OTP'
        message = message = f'Your OTP for password reset is: {otp}\nThis OTP is valid for 10 minutes.'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        send_mail(subject, message, from_email, recipient_list)
        
        return JsonResponse({'success': True, 'message': 'OTP sent successfully'})
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON format'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    
# verify OTP and reset password
@csrf_exempt
def verify_otp_and_reset_password(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'})
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')
        new_password = data.get('newPassword')
        
        if not all ([email, otp, new_password]):
            return JsonResponse({'success': False, 'error': 'Email, OTP and new password are required'})
        
        # verify otp
        try:
            otp_record = PasswordResetOTP.objects.filter(email=email, otp=otp, is_used=False).latest('created_at')
            
            if not otp_record.is_valid():
                return JsonResponse({'success': False, 'error': 'Invalid or expired OTP'})
            
        except PasswordResetOTP.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Invalid or expired OTP'})
        
        # mark otp as used
        otp_record.is_used = True
        otp_record.save()
        
        try:
            # reset password in firebase
            user = auth.get_user_by_email(email)
        
            auth.update_user(user.uid, password=new_password)
        
            return JsonResponse({'success': True, 'message': 'Password reset successfully'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON format'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})    