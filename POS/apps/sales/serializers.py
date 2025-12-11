# serializers.py
from rest_framework import serializers
from .models import Client, Order, OrderItem
from django.db import transaction
from decimal import Decimal
from apps.pricing.models import Item
from datetime import date

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
    factor = serializers.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1'))
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders"""
    customer = serializers.CharField()  # Client ID
    items = OrderItemCreateSerializer(many=True)
    payment_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    payment_method = serializers.CharField(required=True)
    payment_status = serializers.CharField(required=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    
    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        
        customer_id = validated_data['customer']
        items_data = validated_data['items']
        payment_amount = validated_data['payment_amount']
        payment_status = validated_data['payment_status']
        total_amount = validated_data['total_amount']
        balance_due = validated_data['balance_due']
        
        # Get customer
        try:
            customer = Client.objects.get(id=customer_id)
        except Client.DoesNotExist:
            raise serializers.ValidationError({"customer": "Customer not found"})
        
        # Calculate total and prepare order items
        order_total = Decimal('0')
        order_items_to_create = []
        
        for item_data in items_data:
            try:
                product = Item.objects.get(id=item_data['product'])
            except Item.DoesNotExist:
                raise serializers.ValidationError({
                    "items": f"Product {item_data['product']} not found"
                })
            
            quantity = item_data['quantity']
            factor = item_data.get('factor', Decimal('1'))
            
            # Calculate final price: base_price * factor
            final_price = product.price * factor
            line_total = final_price * quantity
            
            order_total += line_total
            
            order_items_to_create.append({
                'item': product,
                'quantity': quantity,
                'price': final_price,  # Store the factored price
            })
        
        # Validate that calculated total matches provided total
        # Convert to float for comparison to handle Decimal objects properly
        if abs(float(order_total) - float(total_amount)) > 0.01:  # Allow for rounding differences
            raise serializers.ValidationError({
                "total_amount": f"Calculated total ({order_total}) doesn't match provided total ({total_amount})"
            })
        
        # Create order (ID will be auto-generated)
        order = Order.objects.create(
            client=customer,
            total=order_total,
            date=date.today(),
            payment_amount=payment_amount,
            payment_status=payment_status,
            balance_due=balance_due
        )
        
        # Create order items
        for item_data in order_items_to_create:
            OrderItem.objects.create(
                order=order,
                item=item_data['item'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
        
        # CORRECTED: Update customer balance based on payment
        # The balance field represents what the customer owes (debt)
        # If customer pays less than total, their debt increases
        # If customer pays more than total, their debt decreases
        # net_balance_change = order_total - payment_amount
        
        net_balance_change = order_total - payment_amount
        customer.balance += net_balance_change
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
        fields = [
            'id', 'client', 'customer_name', 'total', 'date', 
            'payment_amount', 'payment_status', 'balance_due',
            'items'
        ]
        read_only_fields = ['id', 'date']


class ReceiptSerializer(serializers.Serializer):
    """Serializer for receipt data (just for logging/storage if needed)"""
    items = serializers.ListField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    createdAt = serializers.DateTimeField()
    customer = serializers.DictField()
    paid = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    change = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)