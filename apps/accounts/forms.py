# apps/accounts/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from .models import User, UserType, AgeRange

class CustomLoginForm(forms.Form):
    email_or_phone = forms.CharField(
        label=_("E-poçt və ya telefon"),
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': _("E-poçt və ya telefon nömrəsi")})
    )
    password = forms.CharField(
        label=_("Şifrə"),
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': _("Şifrə")})
    )
    remember_me = forms.BooleanField(
        label=_("Məni xatırla"),
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'remember-checkbox'})
    )
    
    def clean_email_or_phone(self):
        """E-poçt və ya telefon nömrəsinin mövcudluğunu yoxlayır"""
        email_or_phone = self.cleaned_data.get('email_or_phone')
        
        # Telefon və ya e-poçt ilə istifadəçi axtarışı
        try:
            user = User.objects.get(email=email_or_phone)
            return email_or_phone
        except User.DoesNotExist:
            try:
                user = User.objects.get(phone_number=email_or_phone)
                return email_or_phone
            except User.DoesNotExist:
                # Sadəcə validasiya xətası göstər, müdaxiləçiyə məlumat vermə
                raise ValidationError(_("Daxil edilən məlumatla hesab tapılmadı"))
        
        return email_or_phone

class CustomRegistrationForm(forms.ModelForm):
    """Təkmilləşdirilmiş qeydiyyat forması"""
    
    # Field for selecting user type
    user_type = forms.ModelChoiceField(
        label=_("Siz kimsiz?"),
        queryset=UserType.objects.all(),
        empty_label=None,
        widget=forms.RadioSelect(attrs={'class': 'user-type-radio'})
    )
    
    # User's full name
    name = forms.CharField(
        label=_("Tam ad"),
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': _("Tam adınız")
        })
    )
    
    # Phone number field
    phone_number = forms.CharField(
        label=_("Telefon nömrəsi"),
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': _("+994501234567"),
            'id': 'id_phone_number'
        })
    )
    
    # Password fields
    password = forms.CharField(
        label=_("Şifrə"),
        widget=forms.PasswordInput(attrs={
            'class': 'form-control', 
            'placeholder': _("Şifrənizi daxil edin"),
            'id': 'id_password'
        })
    )
    
    confirm_password = forms.CharField(
        label=_("Şifrəni təsdiqləyin"),
        widget=forms.PasswordInput(attrs={
            'class': 'form-control', 
            'placeholder': _("Şifrənizi təkrar daxil edin"),
            'id': 'id_confirm_password'
        })
    )
    
    # Gender field with only two options
    gender = forms.ChoiceField(
        label=_("Cins"),
        choices=User.GENDER_CHOICES,  # Using the updated choices from the model
        widget=forms.RadioSelect(attrs={'class': 'gender-radio'})
    )
    
    # Age range selection
    age_range = forms.ModelChoiceField(
        label=_("Yaş aralığı"),
        queryset=AgeRange.objects.all().order_by('display_order'),
        empty_label=None,
        widget=forms.RadioSelect(attrs={'class': 'age-range-radio'})
    )
    
    # Hidden fields for Firebase info
    firebase_uid = forms.CharField(widget=forms.HiddenInput(), required=False)
    is_verified = forms.BooleanField(widget=forms.HiddenInput(), required=False)
    
    class Meta:
        model = User
        fields = ('name', 'phone_number', 'gender', 'firebase_uid', 'is_verified')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Make sure the queryset for user_type and age_range are loaded
        self.fields['user_type'].queryset = UserType.objects.all()
        self.fields['age_range'].queryset = AgeRange.objects.all().order_by('display_order')
    
    def clean_phone_number(self):
        """Telefon nömrəsinin unikallığını yoxlayır"""
        phone_number = self.cleaned_data.get('phone_number')
        
        # Format telefon nömrəsini (tam düzgün format üçün phonenumbers kitabxanası istifadə edilməlidir)
        if not phone_number.startswith('+'):
            phone_number = '+' + phone_number
        
        # Yoxla, bu nömrə ilə istifadəçi var?
        if User.objects.filter(phone_number=phone_number).exists():
            raise ValidationError(_("Bu telefon nömrəsi ilə artıq qeydiyyatdan keçilib."))
        
        return phone_number
    
    def clean(self):
        """Formadan keçən məlumatların əlavə validasiyası"""
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")
        
        # Şifrə və təsdiq şifrəsinin üst-üstə düşməsini yoxla
        if password and confirm_password and password != confirm_password:
            self.add_error('confirm_password', _("Şifrələr uyğun gəlmir."))
        
        # Şifrənin gücünü yoxla
        if password and len(password) < 8:
            self.add_error('password', _("Şifrə ən az 8 simvoldan ibarət olmalıdır."))
        
        return cleaned_data