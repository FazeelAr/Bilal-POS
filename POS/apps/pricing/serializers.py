from rest_framework import serializers
from .models import Item


class ItemSerializer(serializers.ModelSerializer):
    """Serializer for Item (Product) model"""
    product = serializers.IntegerField(source='id', read_only=True)
    product_name = serializers.CharField(source='name', read_only=True)
    
    class Meta:
        model = Item
        fields = ['id', 'product', 'product_name', 'name', 'price']
        read_only_fields = ['id', 'product', 'product_name']


class ItemPriceUpdateSerializer(serializers.Serializer):
    """Serializer for updating item price"""
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    def update(self, instance, validated_data):
        instance.price = validated_data['price']
        instance.save()
        return instance