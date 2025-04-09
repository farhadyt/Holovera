# apps/accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django_countries.fields import CountryField

class User(AbstractUser):
    # Required fields
    name = models.CharField(_("Full name"), max_length=255)
    phone_number = models.CharField(_("Phone number"), max_length=20, unique=True)
    age = models.PositiveIntegerField(_("Age"), null=True, blank=True)
    # Firebase integration
    firebase_uid = models.CharField(_("Firebase UID"), max_length=128, null=True, blank=True, unique=True)
    
    GENDER_CHOICES = (
        ('M', _('Male')),
        ('F', _('Female')),
        ('O', _('Other')),
    )
    gender = models.CharField(_("Gender"), max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    
    # Additional fields
    country = CountryField(_("Country"), blank_label=_("Select country"), null=True, blank=True)
    date_of_birth = models.DateField(_("Date of birth"), null=True, blank=True)
    profile_image = models.ImageField(_("Profile image"), upload_to='profile_images/', null=True, blank=True)
    
    # User types
    is_product_owner = models.BooleanField(_("Is product owner"), default=False)
    is_designer = models.BooleanField(_("Is designer"), default=False)
    
    # Account verification
    is_verified = models.BooleanField(_("Is verified"), default=False)
    
    def __str__(self):
        return self.name or self.username
    
    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")