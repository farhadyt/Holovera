# apps/accounts/services.py
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random
import logging
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from .models import SMSVerification

# Logger quraşdırma
logger = logging.getLogger(__name__)

class SMSService:
    @staticmethod
    def generate_verification_code():
        """6 rəqəmli təsadüfi doğrulama kodu yaradır"""
        return str(random.randint(100000, 999999))
    
    @staticmethod
    def send_verification_code(phone_number):
        """Telefon nömrəsinə doğrulama kodu göndərir"""
        try:
            # Əvvəlki keçərli kodları yoxla
            existing_verification = SMSVerification.objects.filter(
                phone_number=phone_number,
                is_used=False,
                expires_at__gt=timezone.now()
            ).first()
            
            if existing_verification:
                # Əgər istifadə olunmamış və vaxtı bitməmiş kod varsa, onu istifadə et
                verification_code = existing_verification.verification_code
                # Cəhdləri artır
                existing_verification.attempts += 1
                existing_verification.save()
                logger.info(f"Reusing existing verification code for {phone_number}")
            else:
                # Yeni kod generasiya et
                verification_code = SMSService.generate_verification_code()
                
                # Verilənlər bazasında saxla
                expires_at = timezone.now() + timedelta(minutes=10)
                verification = SMSVerification(
                    phone_number=phone_number,
                    verification_code=verification_code,
                    expires_at=expires_at
                )
                verification.save()
                logger.info(f"Generated new verification code for {phone_number}")
            
            # Twilio ilə SMS göndər
            if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
                try:
                    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                    message = client.messages.create(
                        body=f"Holovera doğrulama kodunuz: {verification_code}",
                        from_=settings.TWILIO_PHONE_NUMBER,
                        to=phone_number
                    )
                    logger.info(f"SMS sent to {phone_number}: {message.sid}")
                    return True, verification_code
                except TwilioRestException as twilio_error:
                    logger.error(f"Twilio error: {str(twilio_error)}")
                    return False, f"SMS göndərmə xətası: {str(twilio_error)}"
            else:
                # Twilio konfiqurasiya mövcud deyil
                # DEV MODE: kodu loqa yaz ki, təstdə istifadə oluna bilsin
                if settings.DEBUG:
                    logger.info(f"DEV MODE: Verification code for {phone_number}: {verification_code}")
                    # Təst mühitində həmişə uğurlu qaytar
                    return True, verification_code
                else:
                    logger.error("Twilio credentials are not configured")
                    return False, "Twilio konfiqurasiyası tamamlanmayıb"
                
        except TwilioRestException as e:
            logger.error(f"Twilio error: {str(e)}")
            return False, f"SMS göndərmə xətası: {str(e)}"
        except Exception as e:
            logger.error(f"Error sending SMS: {str(e)}")
            return False, f"Xəta: {str(e)}"
    
    @staticmethod
    def verify_code(phone_number, verification_code):
        """Doğrulama kodunu yoxlayır"""
        try:
            verification = SMSVerification.objects.filter(
                phone_number=phone_number,
                verification_code=verification_code,
                is_used=False,
                expires_at__gt=timezone.now()
            ).first()
            
            if verification:
                # Kodu istifadə edilmiş kimi qeyd et
                verification.is_used = True
                verification.save()
                logger.info(f"Successfully verified code for {phone_number}")
                return True, "Kod uğurla doğrulandı"
            else:
                # Kod mövcud deyil, vaxtı keçib və ya artıq istifadə olunub
                # Ətraflı səbəbi öyrən
                expired_verification = SMSVerification.objects.filter(
                    phone_number=phone_number,
                    verification_code=verification_code,
                    is_used=False,
                    expires_at__lte=timezone.now()
                ).first()
                
                if expired_verification:
                    logger.warning(f"Expired verification code used for {phone_number}")
                    return False, "Doğrulama kodunun vaxtı bitib"
                
                used_verification = SMSVerification.objects.filter(
                    phone_number=phone_number,
                    verification_code=verification_code,
                    is_used=True
                ).first()
                
                if used_verification:
                    logger.warning(f"Already used verification code for {phone_number}")
                    return False, "Bu kod artıq istifadə olunub"
                
                # Kod yanlışdır
                logger.warning(f"Invalid verification code for {phone_number}")
                return False, "Yanlış doğrulama kodu"
                
        except Exception as e:
            logger.error(f"Error verifying code: {str(e)}")
            return False, f"Doğrulama xətası: {str(e)}"