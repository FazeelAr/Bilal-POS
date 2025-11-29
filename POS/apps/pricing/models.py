from django.db import models
from django.contrib.auth.models import User


class Product(models.Model):
    """
    Products will be entered manually in the DB.
    No API needed for adding products.
    """
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class ProductPrice(models.Model):
    """
    Stores the current price of each product.
    Updated daily by the user.
    """
    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    effective_date = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.product.name} - {self.price}"
