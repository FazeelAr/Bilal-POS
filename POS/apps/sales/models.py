from django.db import models
from django.utils import timezone  # Added import


class Client(models.Model):
    """Client model to store customer information"""
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = 'client'

    def __str__(self):
        return self.name


class Order(models.Model):
    # Payment status choices
    PAYMENT_STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('partial', 'Partial Payment'),
        ('unpaid', 'Unpaid'),
    ]
    
    # Payment method choices
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('credit', 'Credit'),
        ('bank_transfer', 'Bank Transfer'),
        ('digital_wallet', 'Digital Wallet'),
    ]
    
    id = models.AutoField(primary_key=True)
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        db_column='client_id',
        related_name='orders'
    )
    total = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    
    # Payment fields
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='cash'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='unpaid'
    )
    balance_due = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = 'order'

    def __str__(self):
        return f"Order {self.id} - {self.client.name}"


class OrderItem(models.Model):
    """Order items model to store line items for each order"""
    # Django will auto-create an id field if not specified
    item = models.ForeignKey(
        'pricing.Item',  # Reference to Item model in pricing app
        on_delete=models.CASCADE,
        db_column='item_id',  # Fixed: changed 'item id' to 'item_id' (no space)
        related_name='order_items'
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        db_column='order_id',
        related_name='items'
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'
        # Composite unique constraint if needed
        # unique_together = [['order', 'item']]

    def __str__(self):
        return f"{self.item.name} - Order {self.order.id}"
    
    
    

class Receipt(models.Model):
    """Receipt model to store immutable receipt data"""
    
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('credit', 'Credit'),
        ('bank_transfer', 'Bank Transfer'),
        ('digital_wallet', 'Digital Wallet'),
    ]
    
    PAYMENT_STATUSES = [
        ('paid', 'Paid'),
        ('partial', 'Partial Payment'),
        ('unpaid', 'Unpaid'),
    ]
    
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,  # Changed from PROTECT to CASCADE
        related_name='receipt',
        db_column='order_id'
    )
    
    # ... rest of your code remains the same
    
    customer = models.ForeignKey(
        Client,
        on_delete=models.PROTECT,
        related_name='receipts',
        db_column='client_id'
    )
    customer_name = models.TextField()  # Store name as it was at time of receipt
    
    # Balance information (snapshot)
    previous_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    current_bill_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_made = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    this_bill_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    updated_balance = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment details
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHODS, 
        default='cash'
    )
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUSES, 
        default='paid'
    )
    
    # Receipt-specific data
    receipt_number = models.CharField(max_length=50, unique=True)
    receipt_date = models.DateTimeField(default=timezone.now)  # Changed from auto_now_add=True
    
    store_name = models.TextField(default='Bilal Poultry Traders')
    store_address = models.TextField(blank=True, null=True)
    store_phone = models.TextField(default='0331-3939373')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    # For reprints tracking
    reprint_count = models.IntegerField(default=0)
    last_reprinted_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'receipts'
        indexes = [
            models.Index(fields=['receipt_number']),
            models.Index(fields=['receipt_date']),
            models.Index(fields=['customer', 'receipt_date']),
        ]
        ordering = ['-receipt_date']
    
    def __str__(self):
        return f"Receipt {self.receipt_number} - {self.customer_name}"
    
    def save(self, *args, **kwargs):
        # Ensure receipt_number is set if not provided
        if not self.receipt_number:
            from datetime import datetime
            # Generate receipt number if not provided
            count = Receipt.objects.count() + 1
            self.receipt_number = f"RCPT-{datetime.now().strftime('%Y%m%d')}-{count:06d}"
        super().save(*args, **kwargs)


class ReceiptItem(models.Model):
    """Receipt line items (immutable copy of order items)"""
    receipt = models.ForeignKey(
        Receipt,
        on_delete=models.CASCADE,
        related_name='items',
        db_column='receipt_id'
    )
    product_name = models.TextField()
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, default='kg')
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    product_id = models.IntegerField(blank=True, null=True)  # Original product ID if available
    
    class Meta:
        db_table = 'receipt_items'
    
    def __str__(self):
        return f"{self.product_name} - {self.quantity}{self.unit}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate total if not provided
        if not self.total and self.quantity and self.price_per_unit:
            self.total = self.quantity * self.price_per_unit
        super().save(*args, **kwargs)