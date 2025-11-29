from rest_framework import generics, permissions
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from datetime import date
from .models import Order, DailySalesSummary
from apps.pricing.models import ProductPrice
from .serializers import OrderSerializer, DailySalesSummarySerializer, MonthlySalesSerializer
from rest_framework.response import Response


class OrderCreateView(generics.CreateAPIView):
    """
    Processes a POS order:
    - Fetch product price
    - Apply quantity * factor
    - Save order + order items
    - Update daily summary
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]


class DailySalesReportView(generics.GenericAPIView):
    """
    Returns:
    - Total sales for today
    - Auto-resets daily summary every new day
    """
    serializer_class = DailySalesSummarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = date.today()
        summary, created = DailySalesSummary.objects.get_or_create(date=today)

        data = {
            "date": summary.date,
            "total_sales": summary.total_sales
        }
        return Response(data)
    

class MonthlySalesReportView(generics.GenericAPIView):
    """
    Returns total sales for each month (grouped by month-year).
    For the graph and table in frontend.
    Works with both SQLite and MySQL/PostgreSQL.
    """
    serializer_class = MonthlySalesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Use Django's TruncMonth to group by month (works across all databases)
        monthly_data = (
            Order.objects
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total_sales=Sum('total_amount'))
            .order_by('month')
        )

        # Format the response to match the expected format
        formatted_data = [
            {
                'month': item['month'].strftime('%Y-%m'),
                'total_sales': item['total_sales']
            }
            for item in monthly_data
        ]

        return Response(formatted_data)