import os
import sys
import django

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'POS.settings')

# Initialize Django
django.setup()

# Get the WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()