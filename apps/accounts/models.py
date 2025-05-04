# apps/accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django_countries.fields import CountryField
from django.utils import timezone
from django.contrib.auth.hashers import make_password

class UserType(models.Model):
    """İstifadəçi tipləri üçün model"""
    name = models.CharField(_("Type name"), max_length=50, unique=True)
    description = models.TextField(_("Description"), blank=True)
    code = models.CharField(_("Type code"), max_length=20, unique=True)
    
    class Meta:
        verbose_name = _("User Type")
        verbose_name_plural = _("User Types")
        
    def __str__(self):
        return self.name

class AgeRange(models.Model):
    """Yaş aralıqları üçün model"""
    range_name = models.CharField(_("Age range"), max_length=20, unique=True)
    min_age = models.PositiveIntegerField(_("Minimum age"))
    max_age = models.PositiveIntegerField(_("Maximum age"), null=True, blank=True)
    display_order = models.PositiveIntegerField(_("Display order"), default=0)
    
    class Meta:
        verbose_name = _("Age Range")
        verbose_name_plural = _("Age Ranges")
        ordering = ['display_order']
        
    def __str__(self):
        if self.max_age:
            return f"{self.min_age}-{self.max_age}"
        return f"{self.min_age}+"
        
class User(AbstractUser):
    # Required fields
    name = models.CharField(_("Full name"), max_length=255)
    phone_number = models.CharField(_("Phone number"), max_length=20, unique=True)
    age = models.PositiveIntegerField(_("Age"), null=True, blank=True)
    # Firebase integration
    firebase_uid = models.CharField(_("Firebase UID"), max_length=128, null=True, blank=True, unique=True)
    
    # Gender choices dəyişdirildi - Digər variantı silindi
    GENDER_CHOICES = (
        ('M', _('Male')),
        ('F', _('Female')),
    )
    gender = models.CharField(_("Gender"), max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    
    # Additional fields
    country = CountryField(_("Country"), blank_label=_("Select country"), null=True, blank=True)
    date_of_birth = models.DateField(_("Date of birth"), null=True, blank=True)
    profile_image = models.ImageField(_("Profile image"), upload_to='profile_images/', null=True, blank=True)
    
    # Relationships with new models
    user_types = models.ManyToManyField(UserType, verbose_name=_("User types"), related_name="users", blank=True)
    age_range = models.ForeignKey(AgeRange, on_delete=models.SET_NULL, verbose_name=_("Age range"), 
                                 related_name="users", null=True, blank=True)
    
    # Account verification
    is_verified = models.BooleanField(_("Is verified"), default=False)
    last_login_ip = models.GenericIPAddressField(_("Last login IP"), null=True, blank=True)
    failed_login_attempts = models.PositiveIntegerField(_("Failed login attempts"), default=0)
    account_locked_until = models.DateTimeField(_("Account locked until"), null=True, blank=True)
    
    # Login metodu - phone/email/social
    LOGIN_METHOD_CHOICES = (
        ('phone', _('Phone')),
        ('email', _('Email')),
        ('facebook', _('Facebook')),
        ('google', _('Google')),
        ('apple', _('Apple')),
    )
    login_method = models.CharField(_("Login method"), max_length=20, choices=LOGIN_METHOD_CHOICES, default='phone')
    
    # Legacy fields - kept for backward compatibility
    is_product_owner = models.BooleanField(_("Is product owner"), default=False)
    is_designer = models.BooleanField(_("Is designer"), default=False)
    
    def __str__(self):
        return self.name or self.username
    
    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
    
    def save(self, *args, **kwargs):
        # Əgər username boşdursa və phone_number varsa, username-i phone_number-ə təyin et
        if not self.username and self.phone_number:
            self.username = self.phone_number
        super().save(*args, **kwargs)
    
    def set_password(self, raw_password):
        """Şifrəni təhlükəsiz şəkildə hash-ləyir və yadda saxlayır"""
        self.password = make_password(raw_password)
    
    def check_login_allowed(self):
        """Hesaba giriş mümkündürmü yoxlayır"""
        # Hesab kilidlənibmi?
        if self.account_locked_until and self.account_locked_until > timezone.now():
            return False, _("Hesabınız müvəqqəti olaraq bloklanıb. Zəhmət olmasa bir az sonra cəhd edin.")
        
        # Hesab doğrulanıbmı?
        if not self.is_verified:
            return False, _("Hesabınız hələ təsdiqlənməyib. Zəhmət olmasa telefon nömrənizi təsdiqləyin.")
        
        # Hesab aktivdir?
        if not self.is_active:
            return False, _("Hesabınız deaktiv edilib. Zəhmət olmasa dəstəklə əlaqə saxlayın.")
        
        return True, ""
    
    def record_login_attempt(self, success, ip_address=None):
        """Login cəhdini qeyd edir və hesabı kiliddləyir"""
        if not success:
            self.failed_login_attempts += 1
            # 5 ardıcıl uğursuz cəhddən sonra hesabı kiliddlə
            if self.failed_login_attempts >= 5:
                self.account_locked_until = timezone.now() + timezone.timedelta(minutes=30)
        else:
            # Uğurlu girişdə sayğacı sıfırla
            self.failed_login_attempts = 0
            self.account_locked_until = None
            # IP ünvanı qeyd et
            if ip_address:
                self.last_login_ip = ip_address
        
        self.save()

class SMSVerification(models.Model):
    """SMS doğrulama kodları üçün model"""
    phone_number = models.CharField(_("Phone number"), max_length=20)
    verification_code = models.CharField(_("Verification code"), max_length=6)
    created_at = models.DateTimeField(_("Created at"), auto_now_add=True)
    expires_at = models.DateTimeField(_("Expires at"))
    is_used = models.BooleanField(_("Is used"), default=False)
    attempts = models.PositiveIntegerField(_("Attempts"), default=0)
    ip_address = models.GenericIPAddressField(_("IP address"), null=True, blank=True)
    
    class Meta:
        verbose_name = _("SMS Verification")
        verbose_name_plural = _("SMS Verifications")
        
    def __str__(self):
        return f"{self.phone_number} - {self.created_at}"
        
    def is_expired(self):
        """Kodun vaxtının keçib-keçmədiyini yoxlayır"""
        return timezone.now() > self.expires_at
    
    def increment_attempts(self):
        """Yoxlama cəhdlərin sayını artırır"""
        self.attempts += 1
        self.save()