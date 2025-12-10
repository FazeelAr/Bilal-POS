from django.contrib import admin
from .models import Client, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    """Inline admin for order items"""
    model = OrderItem
    extra = 1
    fields = ('item', 'quantity', 'price')
    autocomplete_fields = ['item']


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    """Admin interface for Client model"""
    list_display = ('id', 'name', 'balance')
    search_fields = ('id', 'name')
    list_filter = ('balance',)
    ordering = ('name',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin interface for Order model"""
    list_display = ('id', 'client', 'total', 'date')
    list_filter = ('date',)
    search_fields = ('id', 'client__name')
    date_hierarchy = 'date'
    autocomplete_fields = ['client']
    readonly_fields = ('date', 'total')  # Make both date and total read-only
    inlines = [OrderItemInline]
    
    # Simplified fieldsets without 'id'
    fieldsets = (
        ('Order Information', {
            'fields': ('client',)
        }),
        ('Financial', {
            'fields': ('total',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Make additional fields read-only when editing"""
        readonly_fields = super().get_readonly_fields(request, obj)
        if obj:  # If editing an existing object
            # Add client to readonly fields when editing
            readonly_fields = list(readonly_fields) + ['client']
        return readonly_fields


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Admin interface for OrderItem model"""
    list_display = ('id', 'order', 'item', 'quantity', 'price', 'get_line_total')
    list_filter = ('order__date',)
    search_fields = ('order__id', 'item__name')
    autocomplete_fields = ['order', 'item']
    
    def get_line_total(self, obj):
        """Calculate line total"""
        return obj.quantity * obj.price
    get_line_total.short_description = 'Line Total'