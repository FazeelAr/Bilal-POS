from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, OrderViewSet, receipt_view

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path('receipt/', receipt_view, name='receipt'),
]