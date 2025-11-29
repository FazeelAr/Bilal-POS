from django.urls import path
from . import views

urlpatterns = [
    path("products/", views.ProductPriceListView.as_view(), name="product-list"),
    path("products/<int:pk>/update-price/", views.ProductPriceUpdateView.as_view(), name="product-update-price"),
]
