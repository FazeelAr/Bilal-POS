from django.contrib import admin
from .models import Order, OrderItem, DailySalesSummary


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "factor", "unit_price_on_sale", "line_total")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at", "total_amount")
    list_filter = ("created_at", "user")
    search_fields = ("user__username", "id")
    readonly_fields = ("created_at", "total_amount")
    inlines = [OrderItemInline]


@admin.register(DailySalesSummary)
class DailySalesSummaryAdmin(admin.ModelAdmin):
    list_display = ("date", "total_sales")
    list_filter = ("date",)
