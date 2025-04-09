# apps/accounts/urls.py
from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('verify-firebase-token/', views.VerifyFirebaseTokenView.as_view(), name='verify_firebase_token'),
]