import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import firebase_admin
from firebase_admin import auth
from firebase import firebase_admin

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