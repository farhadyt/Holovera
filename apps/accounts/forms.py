# apps/accounts/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.utils.translation import gettext_lazy as _
from .models import User, UserType, AgeRange

class CustomLoginForm(forms.Form):
    email = forms.EmailField(
        label=_("E-poçt"),
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': _("E-poçt ünvanı")})
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

class CustomRegistrationForm(forms.ModelForm):
    """Təkmilləşdirilmiş qeydiyyat forması"""
    
    # Field for selecting user type
    user_type = forms.ModelChoiceField(
        label=_("Siz kimsiz?"),  # Changed text to be more clear
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