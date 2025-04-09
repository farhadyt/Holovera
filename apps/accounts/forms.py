# apps/accounts/forms.py - sadələşdirilmiş versiya
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.utils.translation import gettext_lazy as _
from .models import User

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

class CustomRegistrationForm(UserCreationForm):
    name = forms.CharField(
        label=_("Tam ad"),
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': _("Tam adınız")})
    )
    email = forms.EmailField(
        label=_("E-poçt"),
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': _("E-poçt ünvanı")})
    )
    phone_number = forms.CharField(
        label=_("Telefon nömrəsi"),
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': _("Telefon nömrəsi")})
    )
    age = forms.IntegerField(
        label=_("Yaş"),
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': _("Yaşınız")})
    )
    gender = forms.ChoiceField(
        label=_("Cins"),
        choices=User.GENDER_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    
    class Meta:
        model = User
        fields = ('name', 'email', 'phone_number', 'age', 'gender', 'password1', 'password2')