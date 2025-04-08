from django.urls import path
from .views import predict_total_bill

urlpatterns = [
    path('predict/', predict_total_bill, name='predict-total-bill'),
]
