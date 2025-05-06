from django.urls import path
from .views import predict_total_bill
from .views import get_energy_recommendation

urlpatterns = [
    path('predict/', predict_total_bill, name='predict-total-bill'),
    path('recommend/', get_energy_recommendation, name='get-energy-recommendation'),
]
