from django.db import models
from django.contrib.auth import get_user_model
from apps.pricing.models import Product  # ⭐ Import Product from pricing app

User = get_user_model()


# ⭐ REMOVED duplicate Product model - use the one from pricing app


class Order(models.Model):
    """Represents a sale transaction."""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"Order #{self.id} - {self.created_at.date()}"


class OrderItem(models.Model):
    """Items inside an order."""
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)  # ⭐ Now references pricing.Product
    quantity = models.PositiveIntegerField(default=1)
    factor = models.DecimalField(max_digits=6, decimal_places=2, default=1.0)
    unit_price_on_sale = models.DecimalField(max_digits=10, decimal_places=2)

    # price * factor * quantity
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class DailySalesSummary(models.Model):
    """Stores daily revenue - resets every day automatically from frontend logic."""
    date = models.DateField(unique=True)
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Summary {self.date}: {self.total_sales}"