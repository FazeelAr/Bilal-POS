# my domain name is famtrixsolutions.com but I want to host the app on subdomain names bilalppoultrytraders.famtrixsolutions.com
# I am going to provide you my settings.py file update it and then tell me the furter configurations.
import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# =========================================================
# BASIC SETTINGS
# =========================================================
SECRET_KEY = "your-secret-key"
DEBUG = True

# React frontend (adjust URL if needed)
ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True


# =========================================================
# INSTALLED APPS
# =========================================================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third Party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "rest_framework.authtoken",

    # Your Apps
    "apps.accounts",
    "apps.pricing",
    "apps.sales",
]

# =========================================================
# MIDDLEWARE
# =========================================================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]

ROOT_URLCONF = "POS.urls"

# =========================================================
# TEMPLATES (not used much in API-only backend)
# =========================================================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "POS.wsgi.application"


# =========================================================
# DATABASE SETTINGS
# =========================================================
# For POS, SQLite is fine. If using MySQL later, I can generate config.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# =========================================================
# AUTHENTICATION (JWT)
# =========================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# JWT Configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# =========================================================
# PASSWORD VALIDATORS
# =========================================================
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
]


# =========================================================
# LANGUAGE & TIMEZONE (Pakistan)
# =========================================================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Karachi"
USE_I18N = True
USE_TZ = True


# =========================================================
# STATIC & MEDIA FILES
# =========================================================
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")


# =========================================================
# DEFAULT AUTO FIELD
# =========================================================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"