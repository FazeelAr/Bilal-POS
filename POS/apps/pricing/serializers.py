from rest_framework import serializers
from .models import ProductPrice


class ProductPriceSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductPrice
        fields = [
            'id',
            'product',
            'product_name',
            'price',
            'effective_date',
            'updated_by'
        ]
        read_only_fields = ['updated_by']


class UpdatePriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductPrice
        fields = ['price']

