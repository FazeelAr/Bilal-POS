from django.contrib import admin
from .models import Client, Order, OrderItem

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'balance']
    list_filter = ['name']
    search_fields = ['name']
    ordering = ['name']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    fields = ['item', 'quantity', 'price']
    readonly_fields = ['total_price']
    
    def total_price(self, obj):
        if obj.id:
            return f"Rs {obj.quantity * obj.price:.2f}"
        return "-"
    total_price.short_description = 'Total'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'client', 'total', 'payment_amount', 'payment_status', 'balance_due', 'date', 'item_count']
    list_filter = ['date', 'payment_status', 'client']
    search_fields = ['client__name', 'id']
    date_hierarchy = 'date'
    ordering = ['-date', '-id']
    
    # Show OrderItems inline
    inlines = [OrderItemInline]
    
    # Custom method to show item count
    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Items'
    
    fieldsets = (
        ('Order Information', {
            'fields': ('client', 'total', 'date')
        }),
        ('Payment Information', {
            'fields': ('payment_amount', 'payment_status', 'balance_due'),
        }),
    )

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'item', 'quantity', 'price', 'total_price']
    list_filter = ['order__date', 'item']
    search_fields = ['item__name', 'order__id']
    
    def total_price(self, obj):
        return obj.quantity * obj.price
    total_price.short_description = 'Total'

# Optional: If you want to customize the admin site header
admin.site.site_header = "Bilal Poultry Traders Admin"
admin.site.site_title = "Sales Administration"
admin.site.index_title = "Welcome to Sales Admin"