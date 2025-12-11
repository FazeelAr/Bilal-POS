from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
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
    
    @action(detail=False, methods=['get'], url_path='balances')
    def customer_balances(self, request):
        """
        Get all customers with their balances
        Query params:
        - sort: 'balance' or 'name' (default: 'name')
        - order: 'asc' or 'desc' (default: 'asc')
        """
        try:
            # Get all customers
            customers = Client.objects.all()
            
            # Apply sorting
            sort_by = request.query_params.get('sort', 'name')
            order = request.query_params.get('order', 'asc')
            
            if sort_by == 'balance':
                if order == 'desc':
                    customers = customers.order_by('-balance')
                else:
                    customers = customers.order_by('balance')
            else:  # sort by name
                if order == 'desc':
                    customers = customers.order_by('-name')
                else:
                    customers = customers.order_by('name')
            
            # Calculate total balance
            total_balance = customers.aggregate(total=Sum('balance'))['total'] or 0
            
            # Get customer data
            customer_data = []
            for customer in customers:
                customer_data.append({
                    'id': customer.id,
                    'name': customer.name,
                    'balance': float(customer.balance),
                    'order_count': customer.orders.count(),
                    'last_order_date': customer.orders.order_by('-date').first().date if customer.orders.exists() else None
                })
            
            return Response({
                'customers': customer_data,
                'total_balance': float(total_balance),
                'count': len(customer_data),
                'positive_balance_count': len([c for c in customer_data if c['balance'] > 0]),
                'negative_balance_count': len([c for c in customer_data if c['balance'] < 0]),
                'zero_balance_count': len([c for c in customer_data if c['balance'] == 0])
            })
            
        except Exception as e:
            print(f"Error in customer_balances: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
        orders = Order.objects.filter(date=report_date).select_related('client').prefetch_related('items__item')
        
        # Filter by customer if provided
        customer_id = request.query_params.get('customer')
        customer_filter = None
        customer_balance = None
        
        if customer_id:
            orders = orders.filter(client_id=customer_id)
            try:
                customer = Client.objects.get(id=customer_id)
                customer_filter = customer.name
                customer_balance = float(customer.balance)
            except Client.DoesNotExist:
                customer_filter = f"Customer ID: {customer_id}"
        
        # Calculate total
        total_sales = orders.aggregate(total=Sum('total'))['total'] or 0
        
        # Get order details
        order_details = []
        for order in orders:
            order_data = {
                'id': order.id,
                'customer_name': order.client.name,
                'order_date': order.date.strftime('%Y-%m-%d'),
                'amount': float(order.total),
                'payment_amount': float(order.payment_amount),  # ADD THIS
                'payment_status': order.payment_status,  # ADD THIS
                'balance_due': float(order.balance_due),  # ADD THIS
                'items_count': order.items.count(),
                'items': []
            }
            
            # Add order items
            for item in order.items.all():
                order_data['items'].append({
                    'name': item.item.name,
                    'quantity': float(item.quantity),
                    'price': float(item.price),
                    'total': float(item.quantity * item.price)
                })
            
            order_details.append(order_data)
        
        return Response({
            'date': report_date.strftime('%Y-%m-%d'),
            'total_sales': float(total_sales),
            'order_count': orders.count(),
            'customer_filter': customer_filter,
            'customer_balance': customer_balance,
            'orders': order_details
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
        try:
            orders = Order.objects.all()
            
            # Filter by customer if provided
            customer_id = request.query_params.get('customer')
            customer_filter = None
            customer_balance = None
            
            if customer_id:
                orders = orders.filter(client_id=customer_id)
                try:
                    customer = Client.objects.get(id=customer_id)
                    customer_filter = customer.name
                    customer_balance = float(customer.balance)
                except Client.DoesNotExist:
                    customer_filter = f"Customer ID: {customer_id}"
            
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
            
            # Group by month manually
            monthly_totals = {}
            monthly_orders = {}
            
            # Aggregate orders by month
            for order in orders.select_related('client').iterator():
                try:
                    month_key = order.date.strftime('%Y-%m')
                    
                    if month_key not in monthly_totals:
                        monthly_totals[month_key] = 0
                        monthly_orders[month_key] = []
                    
                    monthly_totals[month_key] += float(order.total)
                    
                    # Get order details
                    order_data = {
                        'id': order.id,
                        'customer_name': order.client.name,
                        'order_date': order.date.strftime('%Y-%m-%d'),
                        'amount': float(order.total),
                        'payment_amount': float(order.payment_amount),  # ADD THIS
                        'payment_status': order.payment_status,  # ADD THIS
                        'balance_due': float(order.balance_due),  # ADD THIS
                        'items_count': order.items.count(),
                        'items': []
                    }
                    
                    # Get items safely
                    try:
                        for order_item in order.items.all().select_related('item'):
                            order_data['items'].append({
                                'name': order_item.item.name if order_item.item else 'Unknown',
                                'quantity': float(order_item.quantity),
                                'price': float(order_item.price),
                                'total': float(order_item.quantity * order_item.price)
                            })
                    except Exception as e:
                        print(f"Error getting items for order {order.id}: {e}")
                    
                    monthly_orders[month_key].append(order_data)
                    
                except Exception as e:
                    print(f"Error processing order {order.id}: {e}")
                    continue
            
            # Convert to list format
            result = []
            for month_key, total_sales in monthly_totals.items():
                month_orders_list = monthly_orders.get(month_key, [])
                result.append({
                    'month': month_key,
                    'total_sales': total_sales,
                    'order_count': len(month_orders_list),
                    'orders': month_orders_list
                })
            
            # Sort by month (descending)
            result.sort(key=lambda x: x['month'], reverse=True)
            
            response_data = {
                'reports': result,
                'customer_filter': customer_filter,
                'customer_balance': customer_balance
            }
            
            return Response(response_data)
            
        except Exception as e:
            print(f"Error in monthly_report: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
        
        try:
            # Filter orders - use simple filter first
            orders = Order.objects.filter(date__gte=start, date__lte=end)
            
            # Filter by customer if provided
            customer_id = request.query_params.get('customer')
            customer_filter = None
            customer_balance = None
            
            if customer_id:
                orders = orders.filter(client_id=customer_id)
                try:
                    customer = Client.objects.get(id=customer_id)
                    customer_filter = customer.name
                    customer_balance = float(customer.balance)
                except Client.DoesNotExist:
                    customer_filter = f"Customer ID: {customer_id}"
            
            # Calculate overall total
            total_sales_result = orders.aggregate(total=Sum('total'))
            total_sales = total_sales_result['total'] or 0
            
            # Get order count
            order_count = orders.count()
            
            # Get all order details for the range
            all_order_details = []
            # Use iterator() to avoid memory issues with large datasets
            for order in orders.select_related('client').iterator():
                try:
                    # Get order items
                    items = []
                    items_count = 0
                    # Try to get items, but don't crash if there's an issue
                    try:
                        order_items = order.items.all()
                        items_count = order_items.count()
                        for order_item in order_items.select_related('item'):
                            items.append({
                                'name': order_item.item.name if order_item.item else 'Unknown',
                                'quantity': float(order_item.quantity),
                                'price': float(order_item.price),
                                'total': float(order_item.quantity * order_item.price)
                            })
                    except Exception as e:
                        print(f"Error getting items for order {order.id}: {e}")
                    
                    order_data = {
                        'id': order.id,
                        'customer_name': order.client.name,
                        'order_date': order.date.strftime('%Y-%m-%d'),
                        'amount': float(order.total),
                        'payment_amount': float(order.payment_amount),  # ADD THIS
                        'payment_status': order.payment_status,  # ADD THIS
                        'balance_due': float(order.balance_due),  # ADD THIS
                        'items_count': order.items.count(),
                        'items': []
                    }
                    
                    all_order_details.append(order_data)
                except Exception as e:
                    print(f"Error processing order {order.id}: {e}")
                    continue
            
            # Create daily breakdown manually instead of using TruncDate
            daily_breakdown = []
            
            # Create a dictionary to aggregate daily sales
            daily_sales = {}
            daily_orders = {}
            
            # Aggregate orders by date
            for order in orders:
                date_str = order.date.strftime('%Y-%m-%d')
                if date_str not in daily_sales:
                    daily_sales[date_str] = 0
                    daily_orders[date_str] = []
                
                daily_sales[date_str] += float(order.total)
                
                # Get order details for this day
                day_order_details = []
                try:
                    order_data = {
                        'id': order.id,
                        'customer_name': order.client.name,
                        'order_date': order.date.strftime('%Y-%m-%d'),
                        'amount': float(order.total),
                        'payment_amount': float(order.payment_amount),  # ADD THIS
                        'payment_status': order.payment_status,  # ADD THIS
                        'balance_due': float(order.balance_due),  # ADD THIS
                        'items_count': order.items.count(),
                        'items': []
                    }
                    
                    for order_item in order.items.all():
                        order_data['items'].append({
                            'name': order_item.item.name if order_item.item else 'Unknown',
                            'quantity': float(order_item.quantity),
                            'price': float(order_item.price),
                            'total': float(order_item.quantity * order_item.price)
                        })
                    
                    day_order_details.append(order_data)
                except Exception as e:
                    print(f"Error creating day order details: {e}")
                
                daily_orders[date_str].extend(day_order_details)
            
            # Convert to list format
            for date_str, sales in daily_sales.items():
                # Count orders for this day
                day_order_count = len(daily_orders[date_str]) if date_str in daily_orders else 0
                
                daily_breakdown.append({
                    'date': date_str,
                    'total_sales': sales,
                    'order_count': day_order_count,
                    'orders': daily_orders.get(date_str, [])
                })
            
            # Sort by date
            daily_breakdown.sort(key=lambda x: x['date'])
            
            result = {
                'start_date': start.strftime('%Y-%m-%d'),
                'end_date': end.strftime('%Y-%m-%d'),
                'total_sales': float(total_sales),
                'order_count': order_count,
                'orders': all_order_details,
                'daily_breakdown': daily_breakdown,
                'customer_filter': customer_filter,
                'customer_balance': customer_balance
            }
            
            return Response(result)
            
        except Exception as e:
            print(f"Error in date_range_report: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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