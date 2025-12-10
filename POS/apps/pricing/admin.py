from django.contrib import admin
from .models import Item


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    """Admin interface for Item model"""
    list_display = ('id', 'name', 'price')
    search_fields = ('id', 'name')
    list_filter = ('price',)
    ordering = ('name',)
    
    # Remove 'id' from fieldsets since it's auto-generated
    fieldsets = (
        ('Product Information', {
            'fields': ('name',)
        }),
        ('Pricing', {
            'fields': ('price',)
        }),
    )
    
    # OR use a simpler fields configuration
    # fields = ('name', 'price')