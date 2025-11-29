from rest_framework import generics, permissions
from .models import ProductPrice, Product
from .serializers import ProductPriceSerializer, UpdatePriceSerializer


class ProductPriceListView(generics.ListAPIView):
    """
    Returns all products with their latest price.
    """
    queryset = ProductPrice.objects.select_related('product').all()
    serializer_class = ProductPriceSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProductPriceUpdateView(generics.UpdateAPIView):
    """
    Updates the price for a product.
    """
    queryset = ProductPrice.objects.all()
    serializer_class = UpdatePriceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
