from django.urls import path
from . import views

urlpatterns = [
    # order processing
    path("orders/create/", views.OrderCreateView.as_view(), name="order-create"),

    # reports
    path("reports/daily/", views.DailySalesReportView.as_view(), name="daily-report"),
    path("reports/monthly/", views.MonthlySalesReportView.as_view(), name="monthly-report"),

    # products
]
