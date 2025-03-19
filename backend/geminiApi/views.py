from django.http import JsonResponse
from gemini_service import get_appliance_wattage

def fetch_appliance_wattage(request):
    appliance_name = request.GET.get("appliance", "")
    
    if not appliance_name:
        return JsonResponse({"error": "Appliance name is required"}, status=400)
    
    wattage_info = get_appliance_wattage(appliance_name)
    
    # Convert string to dictionary
    return JsonResponse({"wattage_info": wattage_info})