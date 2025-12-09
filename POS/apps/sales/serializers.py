from rest_framework import serializers
from .models import Client, Order, OrderItem
from django.db import transaction


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client model"""
    starting_balance = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Client
        fields = ['id', 'name', 'balance', 'starting_balance']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        starting_balance = validated_data.pop('starting_balance', 0)
        validated_data['balance'] = starting_balance
        return super().create(validated_data)


class OrderItemCreateSerializer(serializers.Serializer):
    """Serializer for creating order items"""
    product = serializers.CharField()  # Item ID
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    factor = serializers.DecimalField(max_digits=10, decimal_places=2, default=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders"""
    customer = serializers.CharField()  # Client ID
    items = OrderItemCreateSerializer(many=True)
    
    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        from apps.pricing.models import Item
        from datetime import date
        
        customer_id = validated_data['customer']
        items_data = validated_data['items']
        
        # Get customer
        try:
            customer = Client.objects.get(id=customer_id)
        except Client.DoesNotExist:
            raise serializers.ValidationError({"customer": "Customer not found"})
        
        # Calculate total and prepare order items
        order_total = 0
        order_items_to_create = []
        
        for item_data in items_data:
            try:
                product = Item.objects.get(id=item_data['product'])
            except Item.DoesNotExist:
                raise serializers.ValidationError({
                    "items": f"Product {item_data['product']} not found"
                })
            
            quantity = item_data['quantity']
            factor = item_data.get('factor', 1)
            
            # Calculate final price: base_price * factor
            final_price = product.price * factor
            line_total = final_price * quantity
            
            order_total += line_total
            
            order_items_to_create.append({
                'item': product,
                'quantity': quantity,
                'price': final_price,  # Store the factored price
            })
        
        # Create order (ID will be auto-generated)
        order = Order.objects.create(
            client=customer,
            total=order_total,
            date=date.today()
        )
        
        # Create order items
        for item_data in order_items_to_create:
            OrderItem.objects.create(
                order=order,
                item=item_data['item'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
        
        # Update customer balance (add order total to balance - representing debt)
        customer.balance += order_total
        customer.save()
        
        return order


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem"""
    item_name = serializers.CharField(source='item.name', read_only=True)
    line_total = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'item', 'item_name', 'quantity', 'price', 'line_total']
    
    def get_line_total(self, obj):
        return obj.quantity * obj.price


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order"""
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='client.name', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'client', 'customer_name', 'total', 'date', 'items']
        read_only_fields = ['id', 'total', 'date']


class ReceiptSerializer(serializers.Serializer):
    """Serializer for receipt data (just for logging/storage if needed)"""
    items = serializers.ListField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    createdAt = serializers.DateTimeField()
    customer = serializers.DictField()
    paid = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    change = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)