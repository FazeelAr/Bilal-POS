from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, OrderViewSet, ReceiptViewSet, receipt_view

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'receipts', ReceiptViewSet, basename='receipt')  # Add this line

urlpatterns = [
    path('', include(router.urls)),
    path('receipt/', receipt_view, name='receipt'),  # Legacy endpoint
]