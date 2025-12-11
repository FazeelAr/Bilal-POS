# serializers.py
from rest_framework import serializers
from .models import Client, Order, OrderItem, Receipt, ReceiptItem  # Added Receipt and ReceiptItem
from django.db import transaction
from decimal import Decimal
from apps.pricing.models import Item
from datetime import date, datetime  # Added datetime
import logging

logger = logging.getLogger(__name__)

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
        starting_balance = validated_data.pop('starting_balance', Decimal('0'))
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
        payment_method = validated_data.get('payment_method', 'cash')
        
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
            payment_method=payment_method,
            payment_status=payment_status,
            balance_due=balance_due
        )
        
        # Create order items
        order_items_created = []
        for item_data in order_items_to_create:
            order_item = OrderItem.objects.create(
                order=order,
                item=item_data['item'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            order_items_created.append(order_item)
        
        # CORRECTED: Update customer balance based on payment
        net_balance_change = order_total - payment_amount
        customer.balance += net_balance_change
        customer.save()
        
        # Auto-create receipt after order is created
        try:
            # Calculate previous balance (before this transaction)
            previous_balance = customer.balance - net_balance_change
            
            # Generate receipt number
            receipt_number = f"RCPT-{datetime.now().strftime('%Y%m%d')}-{Receipt.objects.count() + 1:06d}"
            
            # Calculate balances for receipt
            this_bill_balance = max(Decimal('0'), order_total - payment_amount)
            updated_balance = customer.balance  # This is after the balance update
            
            # Create receipt
            receipt = Receipt.objects.create(
                order=order,
                customer=customer,
                customer_name=customer.name,
                previous_balance=previous_balance,
                current_bill_amount=order_total,
                payment_made=payment_amount,
                this_bill_balance=this_bill_balance,
                updated_balance=updated_balance,
                payment_method=payment_method,
                payment_status=payment_status,
                receipt_number=receipt_number,
            )
            
            # Create receipt items
            receipt_items = []
            for order_item in order_items_created:
                receipt_items.append(ReceiptItem(
                    receipt=receipt,
                    product_name=order_item.item.name,
                    quantity=order_item.quantity,
                    unit='kg',  # Adjust based on your product units
                    price_per_unit=order_item.price,
                    total=order_item.quantity * order_item.price,
                    product_id=order_item.item.id
                ))
            
            ReceiptItem.objects.bulk_create(receipt_items)
            
        except Exception as e:
            # Log error but don't fail the order creation
            logger.error(f"Failed to create receipt for order {order.id}: {str(e)}")
        
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
    receipt_number = serializers.SerializerMethodField()  # Add this
    receipt_id = serializers.SerializerMethodField()      # Add this
    
    class Meta:
        model = Order
        fields = [
            'id', 'client', 'customer_name', 'total', 'date', 
            'payment_amount', 'payment_method', 'payment_status', 'balance_due',
            'items', 'receipt_number', 'receipt_id'  # Add these
        ]
        read_only_fields = ['id', 'date']
    
    def get_receipt_number(self, obj):
        if hasattr(obj, 'receipt'):
            return obj.receipt.receipt_number
        return None
    
    def get_receipt_id(self, obj):
        if hasattr(obj, 'receipt'):
            return obj.receipt.id
        return None


class ReceiptItemSerializer(serializers.ModelSerializer):
    """Serializer for ReceiptItem"""
    
    class Meta:
        model = ReceiptItem
        fields = ['product_name', 'quantity', 'unit', 'price_per_unit', 'total', 'product_id']


class ReceiptSerializer(serializers.ModelSerializer):
    """Serializer for Receipt"""
    items = ReceiptItemSerializer(many=True, read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    
    class Meta:
        model = Receipt
        fields = [
            'id', 'order_id', 'receipt_number', 'receipt_date',
            'customer', 'customer_name',
            'previous_balance', 'current_bill_amount', 'payment_made',
            'this_bill_balance', 'updated_balance',
            'payment_method', 'payment_status',
            'store_name', 'store_address', 'store_phone',
            'items', 'reprint_count', 'last_reprinted_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'receipt_number', 'receipt_date', 'created_at',
            'store_name', 'store_address', 'store_phone'
        ]


class ReceiptCreateSerializer(serializers.Serializer):
    """Serializer for creating receipts from order data"""
    order_id = serializers.IntegerField(required=True)
    customer_id = serializers.IntegerField(required=True)
    customer_name = serializers.CharField(required=True)
    previous_balance = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    current_bill_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    payment_made = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    payment_method = serializers.CharField(required=True)
    payment_status = serializers.CharField(required=True)
    
    items = serializers.ListField(
        child=serializers.DictField(),
        required=True
    )
    
    @transaction.atomic
    def create(self, validated_data):
        # Generate receipt number
        receipt_number = f"RCPT-{datetime.now().strftime('%Y%m%d')}-{Receipt.objects.count() + 1:06d}"
        
        # Calculate balances
        this_bill_balance = max(Decimal('0'), validated_data['current_bill_amount'] - validated_data['payment_made'])
        updated_balance = validated_data['previous_balance'] + this_bill_balance
        
        # Create receipt
        receipt = Receipt.objects.create(
            order_id=validated_data['order_id'],
            customer_id=validated_data['customer_id'],
            customer_name=validated_data['customer_name'],
            previous_balance=validated_data['previous_balance'],
            current_bill_amount=validated_data['current_bill_amount'],
            payment_made=validated_data['payment_made'],
            this_bill_balance=this_bill_balance,
            updated_balance=updated_balance,
            payment_method=validated_data['payment_method'],
            payment_status=validated_data['payment_status'],
            receipt_number=receipt_number,
        )
        
        # Create receipt items
        receipt_items = []
        for item_data in validated_data['items']:
            receipt_items.append(ReceiptItem(
                receipt=receipt,
                product_name=item_data.get('name', 'Product'),
                quantity=Decimal(str(item_data.get('quantity', 0))),
                unit=item_data.get('unit', 'kg'),
                price_per_unit=Decimal(str(item_data.get('price_per_unit', 0))),
                total=Decimal(str(item_data.get('total', 0))),
                product_id=item_data.get('product_id')
            ))
        
        ReceiptItem.objects.bulk_create(receipt_items)
        
        return receipt


class ReceiptReprintSerializer(serializers.Serializer):
    """Serializer for reprinting receipts"""
    receipt_id = serializers.IntegerField(required=True)