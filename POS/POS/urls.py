from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from apps.sales.views import ClientViewSet

# Create router for customers (clients)
router = DefaultRouter()
router.register(r'customers', ClientViewSet, basename='customer')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT Authentication
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API endpoints
    path('api/', include(router.urls)),  # Customers endpoint
    path('api/pricing/', include('apps.pricing.urls')),
    path('api/sales/', include('apps.sales.urls')),
]