from django.urls import path
from .views import fetch_appliance_wattage

urlpatterns = [
    path("get-wattage/", fetch_appliance_wattage, name="get_wattage"),
]