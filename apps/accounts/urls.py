# apps/accounts/urls.py
from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', views.CustomLogoutView.as_view(), name='logout'), 
    path('api/send-verification-code/', views.SendVerificationCodeView.as_view(), name='send_verification_code'),
    path('api/verify-code/', views.VerifyCodeView.as_view(), name='verify_code'),
]