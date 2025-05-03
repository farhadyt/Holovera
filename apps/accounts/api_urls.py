# apps/accounts/api_urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('send-verification-code/', views.SendVerificationCodeView.as_view(), name='send_verification_code'),
    path('verify-code/', views.VerifyCodeView.as_view(), name='verify_code'),
]