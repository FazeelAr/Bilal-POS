from django.contrib import admin
from .models import Product, ProductPrice


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(ProductPrice)
class ProductPriceAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "price", "effective_date", "updated_by")
    list_filter = ("effective_date",)
    search_fields = ("product__name",)
    autocomplete_fields = ("product", "updated_by")
