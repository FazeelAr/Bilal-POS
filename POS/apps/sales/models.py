from django.db import models


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
    """Order model to store order information"""
    id = models.AutoField(primary_key=True)
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        db_column='client_id',
        related_name='orders'
    )
    total = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)

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
        db_column='item id',
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