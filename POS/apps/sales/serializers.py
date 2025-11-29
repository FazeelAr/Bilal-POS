from rest_framework import serializers
from .models import Order, OrderItem, DailySalesSummary
from apps.pricing.models import Product, ProductPrice


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'product', 
            'product_name',
            'quantity',
            'factor',
            'unit_price_on_sale',
            'line_total'
        ]
        read_only_fields = ['unit_price_on_sale', 'line_total', 'product_name']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Order
        fields = ['id', 'user', 'created_at', 'total_amount', 'items']
        read_only_fields = ['total_amount', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = validated_data.get('user')

        total_amount = 0
        order = Order.objects.create(user=user, total_amount=0)

        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            factor = item_data.get('factor', 1)

            # ⭐ Get the current price from ProductPrice table
            try:
                product_price = ProductPrice.objects.get(product=product)
                unit_price = product_price.price
            except ProductPrice.DoesNotExist:
                raise serializers.ValidationError(
                    f"Price not found for product: {product.name}"
                )

            line_total = unit_price * quantity * factor
            total_amount += line_total

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                factor=factor,
                unit_price_on_sale=unit_price,
                line_total=line_total
            )

        order.total_amount = total_amount
        order.save()

        # update daily summary
        from datetime import date
        summary, _ = DailySalesSummary.objects.get_or_create(date=date.today())
        summary.total_sales += total_amount
        summary.save()

        return order


class DailySalesSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySalesSummary
        fields = ['date', 'total_sales']


class MonthlySalesSerializer(serializers.Serializer):
    month = serializers.CharField()
    total_sales = serializers.DecimalField(max_digits=12, decimal_places=2)