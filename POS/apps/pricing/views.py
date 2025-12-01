from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Item
from .serializers import ItemSerializer, ItemPriceUpdateSerializer


class ItemViewSet(viewsets.ModelViewSet):
    """ViewSet for Item (Product) operations"""
    queryset = Item.objects.all().order_by('name')
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['patch'], url_path='update-price')
    def update_price(self, request, pk=None):
        """Update item price"""
        item = self.get_object()
        serializer = ItemPriceUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.update(item, serializer.validated_data)
            return Response(
                ItemSerializer(item).data,
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)