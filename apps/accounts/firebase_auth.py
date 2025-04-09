import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings
import pyrebase
from django.contrib.auth import get_user_model

User = get_user_model()

# Firebase Admin SDK (server side)
cred = credentials.Certificate(settings.FIREBASE_ADMIN_SDK_PATH)
firebase_admin.initialize_app(cred)

# Pyrebase for client-side authentication
firebase = pyrebase.initialize_app(settings.FIREBASE_CONFIG)
auth_firebase = firebase.auth()

def verify_firebase_token(id_token):
    """Firebase ID token-ın düzgünlüyünü yoxlayır və Firebase user data qaytarır"""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Firebase token verification error: {e}")
        return None

def get_or_create_user(firebase_user):
    """Firebase istifadəçisinə uyğun Django istifadəçisi yaradır və ya mövcud olanı tapır"""
    email = firebase_user.get('email')
    uid = firebase_user.get('uid')
    
    if not email:
        return None
    
    try:
        # Email-ə görə istifadəçini tap
        user = User.objects.get(email=email)
        
        # Firebase UID-ni yenilə (əgər dəyişibsə)
        if not user.firebase_uid or user.firebase_uid != uid:
            user.firebase_uid = uid
            user.save()
        
    except User.DoesNotExist:
        # Yeni istifadəçi yarat
        name = firebase_user.get('name', '')
        phone_number = firebase_user.get('phoneNumber', '')
        
        # Təhlükəsiz şifrə generasiya et
        import secrets
        import string
        password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
        
        user = User.objects.create_user(
            username=email,  # email-i username kimi istifadə edirik
            email=email,
            password=password,
            name=name,
            phone_number=phone_number,
            firebase_uid=uid,
            is_verified=True  # Firebase istifadəçiləri verify olunur
        )
    
    return user