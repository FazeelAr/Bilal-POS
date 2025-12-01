from django.db import models


class Item(models.Model):
    """Item model to store product information"""
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'items'

    def __str__(self):
        return self.name