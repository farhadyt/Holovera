# apps/accounts/firebase_auth.py
import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings
from django.contrib.auth import get_user_model
import logging

# Logger quraşdırma
logger = logging.getLogger(__name__)

User = get_user_model()

# Singleton pattern tətbiq et
_firebase_app = None

def initialize_firebase():
    """Firebase Admin SDK inisiallizasiyası - yalnız bir dəfə çağırılır"""
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
        
    if hasattr(settings, 'FIREBASE_ADMIN_SDK_PATH') and settings.FIREBASE_ADMIN_SDK_PATH:
        try:
            cred = credentials.Certificate(settings.FIREBASE_ADMIN_SDK_PATH)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK successfully initialized")
            return _firebase_app
        except Exception as e:
            logger.error(f"Firebase Admin SDK initialization error: {e}")
            return None
    else:
        logger.warning("Firebase Admin SDK path not configured")
        return None

def verify_firebase_token(id_token):
    """Firebase ID token-ın düzgünlüyünü yoxlayır və Firebase user data qaytarır"""
    # Firebase inisiallizasiya et (əgər inisiallizasiya olunmayıbsa)
    app = initialize_firebase()
    
    if not app:
        logger.error("Firebase Admin SDK not initialized, cannot verify token")
        return None
        
    try:
        # Token-i doğrula
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except auth.ExpiredIdTokenError:
        logger.warning("Firebase token has expired")
        return None
    except auth.InvalidIdTokenError:
        logger.warning("Firebase token is invalid")
        return None
    except auth.RevokedIdTokenError:
        logger.warning("Firebase token has been revoked")
        return None
    except Exception as e:
        logger.error(f"Firebase token verification error: {e}")
        return None

def get_or_create_user(firebase_user):
    """Firebase istifadəçisinə uyğun Django istifadəçisi yaradır və ya mövcud olanı tapır"""
    if not firebase_user:
        logger.error("No firebase user data provided")
        return None
        
    uid = firebase_user.get('uid')
    email = firebase_user.get('email')
    phone_number = firebase_user.get('phone_number')
    
    if not uid:
        logger.error("Firebase user data missing UID")
        return None
    
    # Əvvəlcə Firebase UID ilə axtarış et
    try:
        user = User.objects.get(firebase_uid=uid)
        logger.info(f"Found existing user with Firebase UID: {uid}")
        return user
    except User.DoesNotExist:
        # Firebase UID ilə istifadəçi tapılmadı
        pass
    
    # Email ilə axtarış et (varsa)
    if email:
        try:
            user = User.objects.get(email=email)
            # Firebase UID-ni yenilə
            user.firebase_uid = uid
            user.save(update_fields=['firebase_uid'])
            logger.info(f"Updated Firebase UID for user with email: {email}")
            return user
        except User.DoesNotExist:
            # Email ilə istifadəçi tapılmadı
            pass
    
    # Telefon nömrəsi ilə axtarış et (varsa)
    if phone_number:
        try:
            user = User.objects.get(phone_number=phone_number)
            # Firebase UID-ni yenilə
            user.firebase_uid = uid
            # Əgər email də varsa və istifadəçinin emaili yoxdursa, onu da yenilə
            if email and not user.email:
                user.email = email
            user.save()
            logger.info(f"Updated Firebase UID for user with phone: {phone_number}")
            return user
        except User.DoesNotExist:
            # Telefon nömrəsi ilə istifadəçi tapılmadı
            pass
    
    # İstifadəçi tapılmadı, yenisini yarat
    try:
        # Firebase-dən əldə edə biləcəyimiz məlumatları toplayırıq
        name = firebase_user.get('name', '')
        display_name = firebase_user.get('display_name', '')
        
        # Şifrə generasiya et
        import secrets
        import string
        password = ''.join(secrets.choice(string.ascii_letters + string.digits + string.punctuation) for _ in range(20))
        
        # İstifadəçi adını təyin et (email, telefon və ya uid əsasında)
        username = email or phone_number or f"firebase_{uid}"
        
        # Yeni istifadəçi yarat
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            name=name or display_name or "Firebase User",
            phone_number=phone_number,
            firebase_uid=uid,
            is_verified=True,  # Firebase istifadəçiləri verify olunur
            login_method='firebase'
        )
        
        logger.info(f"Created new user with Firebase UID: {uid}")
        return user
        
    except Exception as e:
        logger.error(f"Error creating user from Firebase data: {e}")
        return None