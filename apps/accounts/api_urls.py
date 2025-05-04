# apps/accounts/api_urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('send-verification-code/', views.SendVerificationCodeView.as_view(), name='send_verification_code'),
    path('verify-code/', views.VerifyCodeView.as_view(), name='verify_code'),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-firebase-token/', views.VerifyFirebaseTokenView.as_view(), name='verify_firebase_token'),
]