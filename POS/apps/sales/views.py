from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from django.db.models.functions import TruncDate, TruncMonth
from datetime import datetime, date
from .models import Client, Order, OrderItem
from .serializers import (
    ClientSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    ReceiptSerializer
)


class ClientViewSet(viewsets.ModelViewSet):
    """ViewSet for Client (Customer) operations"""
    queryset = Client.objects.all().order_by('name')
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for Order operations"""
    queryset = Order.objects.all().select_related('client').prefetch_related('items')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'], url_path='create')
    def create_order(self, request):
        """Create a new order with items"""
        serializer = OrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()
            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='reports/daily')
    def daily_report(self, request):
        """
        Generate daily sales report
        Query params:
        - date: YYYY-MM-DD (default: today)
        - customer: customer ID (optional)
        """
        # Get date parameter or use today
        date_str = request.query_params.get('date')
        if date_str:
            try:
                report_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            report_date = date.today()
        
        # Filter orders
        orders = Order.objects.filter(date=report_date)
        
        # Filter by customer if provided
        customer_id = request.query_params.get('customer')
        if customer_id:
            orders = orders.filter(client_id=customer_id)
        
        # Calculate total
        total_sales = orders.aggregate(total=Sum('total'))['total'] or 0
        
        return Response({
            'date': report_date,
            'total_sales': total_sales,
            'order_count': orders.count(),
            'customer_filter': customer_id if customer_id else None
        })
    
    @action(detail=False, methods=['get'], url_path='reports/monthly')
    def monthly_report(self, request):
        """
        Generate monthly sales report
        Query params:
        - start_date: YYYY-MM-DD (optional)
        - end_date: YYYY-MM-DD (optional)
        - customer: customer ID (optional)
        """
        orders = Order.objects.all()
        
        # Filter by customer if provided
        customer_id = request.query_params.get('customer')
        if customer_id:
            orders = orders.filter(client_id=customer_id)
        
        # Filter by date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d').date()
                orders = orders.filter(date__gte=start)
            except ValueError:
                return Response(
                    {'error': 'Invalid start_date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if end_date:
            try:
                end = datetime.strptime(end_date, '%Y-%m-%d').date()
                orders = orders.filter(date__lte=end)
            except ValueError:
                return Response(
                    {'error': 'Invalid end_date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Group by month and calculate totals
        monthly_data = (
            orders
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total_sales=Sum('total'))
            .order_by('-month')
        )
        
        # Format response
        result = [
            {
                'month': item['month'].strftime('%Y-%m'),
                'total_sales': item['total_sales']
            }
            for item in monthly_data
        ]
        
        return Response(result)
    
    @action(detail=False, methods=['get'], url_path='reports/date-range')
    def date_range_report(self, request):
        """
        Generate sales report for a date range
        Query params:
        - start_date: YYYY-MM-DD (required)
        - end_date: YYYY-MM-DD (required)
        - customer: customer ID (optional)
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {'error': 'Both start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filter orders
        orders = Order.objects.filter(date__gte=start, date__lte=end)
        
        # Filter by customer if provided
        customer_id = request.query_params.get('customer')
        if customer_id:
            orders = orders.filter(client_id=customer_id)
        
        # Group by date and calculate totals
        daily_data = (
            orders
            .annotate(report_date=TruncDate('date'))
            .values('report_date')
            .annotate(total_sales=Sum('total'))
            .order_by('report_date')
        )
        
        # Calculate overall total
        total_sales = orders.aggregate(total=Sum('total'))['total'] or 0
        
        result = {
            'start_date': start,
            'end_date': end,
            'total_sales': total_sales,
            'order_count': orders.count(),
            'daily_breakdown': [
                {
                    'date': item['report_date'],
                    'total_sales': item['total_sales']
                }
                for item in daily_data
            ],
            'customer_filter': customer_id if customer_id else None
        }
        
        return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def receipt_view(request):
    """
    Handle receipt data (can be used for logging or additional processing)
    """
    serializer = ReceiptSerializer(data=request.data)
    if serializer.is_valid():
        # Here you can add additional logic like:
        # - Logging receipt prints
        # - Sending email receipts
        # - Storing receipt copies
        # For now, just return success with the data
        return Response({
            'id': f"RCP-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            'status': 'success',
            'data': serializer.validated_data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)