from django.contrib import admin
from .models import Item


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    """Admin interface for Item model"""
    list_display = ('id', 'name', 'price')
    search_fields = ('id', 'name')
    list_filter = ('price',)
    ordering = ('name',)
    
    fieldsets = (
        ('Product Information', {
            'fields': ('id', 'name')
        }),
        ('Pricing', {
            'fields': ('price',)
        }),
    )