from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    

    # auth (login / logout)
    path('api/auth/', include('apps.accounts.urls')),

    # pricing module
    path("api/pricing/", include("apps.pricing.urls")),

    # sales module
    path("api/sales/", include("apps.sales.urls")),

]
