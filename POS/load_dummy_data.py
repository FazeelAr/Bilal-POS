from django.core.management.base import BaseCommand
from apps.sales.models import Client, Order, OrderItem
from apps.pricing.models import Item
from datetime import date


class Command(BaseCommand):
    help = 'Load dummy data for POS system'

    def handle(self, *args, **kwargs):
        self.stdout.write('Loading dummy data...')
        
        # Clear existing data (optional)
        # OrderItem.objects.all().delete()
        # Order.objects.all().delete()
        # Client.objects.all().delete()
        # Item.objects.all().delete()
        
        # Create Clients
        self.stdout.write('Creating clients...')
        clients = [
            Client(id='CUST001', name='Ahmed Khan', balance=15000.00),
            Client(id='CUST002', name='Fatima Malik', balance=8500.50),
            Client(id='CUST003', name='Ali Hassan', balance=0.00),
            Client(id='CUST004', name='Sara Ahmed', balance=22000.00),
            Client(id='CUST005', name='Muhammad Bilal', balance=5000.00),
            Client(id='CUST006', name='Ayesha Noor', balance=12500.75),
            Client(id='CUST007', name='Usman Tariq', balance=3000.00),
            Client(id='CUST008', name='Zainab Ali', balance=0.00),
            Client(id='CUST009', name='Hassan Raza', balance=18000.00),
            Client(id='CUST010', name='Mariam Yousaf', balance=6500.00),
        ]
        Client.objects.bulk_create(clients, ignore_conflicts=True)
        
        # Create Items
        self.stdout.write('Creating items...')
        items = [
            Item(id='PROD001', name='Fresh Chicken (Whole)', price=320.00),
            Item(id='PROD002', name='Chicken Breast (Boneless)', price=450.00),
            Item(id='PROD003', name='Chicken Legs', price=280.00),
            Item(id='PROD004', name='Chicken Wings', price=350.00),
            Item(id='PROD005', name='Chicken Mince', price=380.00),
            Item(id='PROD006', name='Chicken Thighs', price=340.00),
            Item(id='PROD007', name='Chicken Drumsticks', price=300.00),
            Item(id='PROD008', name='Chicken Liver', price=250.00),
            Item(id='PROD009', name='Chicken Gizzards', price=220.00),
            Item(id='PROD010', name='Chicken Hearts', price=200.00),
            Item(id='PROD011', name='Chicken Feet', price=150.00),
            Item(id='PROD012', name='Whole Turkey', price=650.00),
            Item(id='PROD013', name='Duck (Whole)', price=580.00),
            Item(id='PROD014', name='Quail (Whole)', price=180.00),
            Item(id='PROD015', name='Eggs (Dozen)', price=280.00),
        ]
        Item.objects.bulk_create(items, ignore_conflicts=True)
        
        # Create Orders
        self.stdout.write('Creating orders...')
        orders = [
            Order(id='ORD001', client_id='CUST001', total=4800.00, date=date(2024, 11, 15)),
            Order(id='ORD002', client_id='CUST002', total=3200.00, date=date(2024, 11, 15)),
            Order(id='ORD003', client_id='CUST001', total=2700.00, date=date(2024, 11, 16)),
            Order(id='ORD004', client_id='CUST003', total=5400.00, date=date(2024, 11, 16)),
            Order(id='ORD005', client_id='CUST004', total=6800.00, date=date(2024, 11, 17)),
            Order(id='ORD006', client_id='CUST005', total=1950.00, date=date(2024, 11, 17)),
            Order(id='ORD007', client_id='CUST002', total=4500.00, date=date(2024, 11, 18)),
            Order(id='ORD008', client_id='CUST006', total=3850.00, date=date(2024, 11, 18)),
            Order(id='ORD009', client_id='CUST007', total=2200.00, date=date(2024, 11, 19)),
            Order(id='ORD010', client_id='CUST001', total=7200.00, date=date(2024, 11, 19)),
            Order(id='ORD011', client_id='CUST008', total=3600.00, date=date(2024, 11, 20)),
            Order(id='ORD012', client_id='CUST009', total=5100.00, date=date(2024, 11, 20)),
            Order(id='ORD013', client_id='CUST004', total=4200.00, date=date(2024, 11, 21)),
            Order(id='ORD014', client_id='CUST010', total=2900.00, date=date(2024, 11, 21)),
            Order(id='ORD015', client_id='CUST003', total=6400.00, date=date(2024, 11, 22)),
            Order(id='ORD016', client_id='CUST001', total=3300.00, date=date(2024, 11, 25)),
            Order(id='ORD017', client_id='CUST002', total=4750.00, date=date(2024, 11, 26)),
            Order(id='ORD018', client_id='CUST005', total=2850.00, date=date(2024, 11, 27)),
            Order(id='ORD019', client_id='CUST006', total=5600.00, date=date(2024, 11, 28)),
            Order(id='ORD020', client_id='CUST009', total=8200.00, date=date(2024, 11, 29)),
        ]
        Order.objects.bulk_create(orders, ignore_conflicts=True)
        
        # Create Order Items
        self.stdout.write('Creating order items...')
        order_items = [
            # Order 1
            OrderItem(item_id='PROD001', quantity=10.00, price=352.00, order_id='ORD001'),
            OrderItem(item_id='PROD002', quantity=5.00, price=495.00, order_id='ORD001'),
            # Order 2
            OrderItem(item_id='PROD003', quantity=8.00, price=308.00, order_id='ORD002'),
            OrderItem(item_id='PROD004', quantity=4.00, price=350.00, order_id='ORD002'),
            # Order 3
            OrderItem(item_id='PROD005', quantity=5.00, price=418.00, order_id='ORD003'),
            OrderItem(item_id='PROD006', quantity=3.00, price=340.00, order_id='ORD003'),
            # Order 4
            OrderItem(item_id='PROD001', quantity=12.00, price=352.00, order_id='ORD004'),
            OrderItem(item_id='PROD007', quantity=6.00, price=330.00, order_id='ORD004'),
            # Order 5
            OrderItem(item_id='PROD002', quantity=10.00, price=495.00, order_id='ORD005'),
            OrderItem(item_id='PROD004', quantity=5.00, price=385.00, order_id='ORD005'),
            # Order 6
            OrderItem(item_id='PROD008', quantity=3.00, price=275.00, order_id='ORD006'),
            OrderItem(item_id='PROD009', quantity=4.00, price=242.00, order_id='ORD006'),
            # Order 7
            OrderItem(item_id='PROD001', quantity=10.00, price=352.00, order_id='ORD007'),
            OrderItem(item_id='PROD003', quantity=4.00, price=308.00, order_id='ORD007'),
            # Order 8
            OrderItem(item_id='PROD006', quantity=7.00, price=374.00, order_id='ORD008'),
            OrderItem(item_id='PROD005', quantity=3.00, price=418.00, order_id='ORD008'),
            # Order 9
            OrderItem(item_id='PROD007', quantity=5.00, price=330.00, order_id='ORD009'),
            OrderItem(item_id='PROD011', quantity=4.00, price=165.00, order_id='ORD009'),
            # Order 10
            OrderItem(item_id='PROD002', quantity=12.00, price=495.00, order_id='ORD010'),
            OrderItem(item_id='PROD004', quantity=3.00, price=385.00, order_id='ORD010'),
            # Continue for remaining orders...
            OrderItem(item_id='PROD001', quantity=8.00, price=352.00, order_id='ORD011'),
            OrderItem(item_id='PROD015', quantity=6.00, price=308.00, order_id='ORD011'),
            OrderItem(item_id='PROD012', quantity=6.00, price=715.00, order_id='ORD012'),
            OrderItem(item_id='PROD005', quantity=3.00, price=418.00, order_id='ORD012'),
            OrderItem(item_id='PROD003', quantity=10.00, price=308.00, order_id='ORD013'),
            OrderItem(item_id='PROD006', quantity=4.00, price=374.00, order_id='ORD013'),
            OrderItem(item_id='PROD007', quantity=7.00, price=330.00, order_id='ORD014'),
            OrderItem(item_id='PROD008', quantity=2.00, price=275.00, order_id='ORD014'),
            OrderItem(item_id='PROD002', quantity=10.00, price=495.00, order_id='ORD015'),
            OrderItem(item_id='PROD004', quantity=4.00, price=385.00, order_id='ORD015'),
            OrderItem(item_id='PROD001', quantity=8.00, price=352.00, order_id='ORD016'),
            OrderItem(item_id='PROD009', quantity=3.00, price=242.00, order_id='ORD016'),
            OrderItem(item_id='PROD013', quantity=5.00, price=638.00, order_id='ORD017'),
            OrderItem(item_id='PROD015', quantity=8.00, price=308.00, order_id='ORD017'),
            OrderItem(item_id='PROD005', quantity=5.00, price=418.00, order_id='ORD018'),
            OrderItem(item_id='PROD010', quantity=3.00, price=220.00, order_id='ORD018'),
            OrderItem(item_id='PROD002', quantity=8.00, price=495.00, order_id='ORD019'),
            OrderItem(item_id='PROD003', quantity=6.00, price=308.00, order_id='ORD019'),
            OrderItem(item_id='PROD012', quantity=8.00, price=715.00, order_id='ORD020'),
            OrderItem(item_id='PROD001', quantity=6.00, price=352.00, order_id='ORD020'),
        ]
        OrderItem.objects.bulk_create(order_items, ignore_conflicts=True)
        
        self.stdout.write(self.style.SUCCESS('Successfully loaded dummy data!'))
        self.stdout.write(f'Created {Client.objects.count()} clients')
        self.stdout.write(f'Created {Item.objects.count()} items')
        self.stdout.write(f'Created {Order.objects.count()} orders')
        self.stdout.write(f'Created {OrderItem.objects.count()} order items')