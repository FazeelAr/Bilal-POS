from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, DailySalesSummary
from datetime import date

@receiver(post_save, sender=Order)
def update_daily_sales_summary(sender, instance, created, **kwargs):
    """
    After an Order is created, update DailySalesSummary for today.
    """
    if created:
        today = date.today()
        summary, _ = DailySalesSummary.objects.get_or_create(date=today)
        summary.total_sales += instance.total_amount
        summary.save()
