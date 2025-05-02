# apps/accounts/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic import FormView, CreateView, View
from django.utils.translation import gettext_lazy as _  # Tərcümə üçün
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from datetime import timedelta
from .models import SMSVerification
from django.http import JsonResponse
import json

from .forms import CustomLoginForm, CustomRegistrationForm

class LoginView(FormView):
    template_name = 'accounts/login.html'
    form_class = CustomLoginForm
    success_url = reverse_lazy('home')
    
    def dispatch(self, request, *args, **kwargs):
        # İstifadəçi artıq login olubsa, ana səhifəyə yönləndir
        if request.user.is_authenticated:
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from django.conf import settings
        
        # Firebase konfiqurasiyasını JSON formatında ötürmək
        if hasattr(settings, 'FIREBASE_CONFIG') and settings.FIREBASE_CONFIG:
            context['firebase_config'] = json.dumps(settings.FIREBASE_CONFIG)
        return context
    
    def form_valid(self, form):
        email = form.cleaned_data['email']
        password = form.cleaned_data['password']
        user = authenticate(username=email, password=password)
        
        if user is not None:
            login(self.request, user)
            messages.success(self.request, _("Uğurla daxil oldunuz!"))
            
            # next parametri varsa, ora yönləndir
            next_url = self.request.GET.get('next')
            if next_url:
                return redirect(next_url)
                
            return super().form_valid(form)
        else:
            messages.error(self.request, _("Yanlış e-poçt və ya şifrə."))
            return self.form_invalid(form)

# apps/accounts/views.py - RegisterView sinfi
class RegisterView(CreateView):
    template_name = 'accounts/register.html'
    form_class = CustomRegistrationForm
    success_url = reverse_lazy('login')
    
    def dispatch(self, request, *args, **kwargs):
        # İstifadəçi artıq login olubsa, ana səhifəyə yönləndir
        if request.user.is_authenticated:
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from django.conf import settings
        
        # Firebase konfiqurasiyasını JSON formatında ötürmək
        if hasattr(settings, 'FIREBASE_CONFIG') and settings.FIREBASE_CONFIG:
            context['firebase_config'] = json.dumps(settings.FIREBASE_CONFIG)
        return context
    
    def form_valid(self, form):
        user = form.save(commit=False)
        
        # Firebase UID və telefon nömrəsini formdan alırıq
        firebase_uid = form.cleaned_data.get('firebase_uid')
        phone_number = form.cleaned_data.get('phone_number')
        
        # İstifadəçi adını telefon nömrəsinə təyin edirik
        user.username = phone_number
        user.firebase_uid = firebase_uid
        user.is_verified = form.cleaned_data.get('is_verified', False)
        
        # Seçilmiş yaş aralığını təyin edirik
        age_range = form.cleaned_data.get('age_range')
        if age_range:
            user.age_range = age_range
            # Yaş sahəsinə orta dəyəri qoyuruq
            if age_range.max_age:
                user.age = (age_range.min_age + age_range.max_age) // 2
            else:
                user.age = age_range.min_age
        
        # İstifadəçini saxlayırıq
        user.save()
        
        # İstifadəçi tipini əlavə edirik (ManyToMany əlaqə olduğu üçün save-dən sonra)
        user_type = form.cleaned_data.get('user_type')
        if user_type:
            user.user_types.add(user_type)
            
            # Legacy fields üçün uyğunluq
            if user_type.code == 'product_owner':
                user.is_product_owner = True
            elif user_type.code == 'designer':
                user.is_designer = True
            user.save()
        
        messages.success(self.request, _("Hesabınız yaradıldı! İndi daxil ola bilərsiniz."))
        return super().form_valid(form)

@method_decorator(csrf_exempt, name='dispatch')
class VerifyFirebaseTokenView(View):
    """Firebase auth token-ni yoxlayır və istifadəçini login edir"""
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            id_token = data.get('idToken')
            
            if not id_token:
                return JsonResponse({'success': False, 'error': _('Token təqdim edilməyib')}, status=400)
            
            # Firebase integration işləmirsə geçici olarak deaktive edirik
            firebase_user = {'uid': 'test', 'phone_number': data.get('phone_number')}
            user = self.get_or_create_user(firebase_user)
            
            if not user:
                return JsonResponse({'success': False, 'error': _('İstifadəçi yaradıla bilmədi')}, status=400)
            
            # User-i login et
            login(request, user)
            
            return JsonResponse({
                'success': True, 
                'redirect_url': request.GET.get('next', str(reverse_lazy('home')))
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    def get_or_create_user(self, firebase_user):
        # Temporary mock implementation
        from django.contrib.auth import get_user_model
        User = get_user_model()
        phone = firebase_user.get('phone_number')
        
        try:
            user = User.objects.get(phone_number=phone)
            return user
        except User.DoesNotExist:
            return None
        

@method_decorator(csrf_exempt, name='dispatch')
class SaveVerificationView(View):
    """SMS doğrulama məlumatlarını saxlayan API endpoint"""
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            phone_number = data.get('phone_number')
            verification_code = data.get('verification_code')
            
            if not phone_number or not verification_code:
                return JsonResponse({'success': False, 'error': _('Telefon nömrəsi və doğrulama kodu tələb olunur')})
            
            # Doğrulama məlumatlarını saxla
            expires_at = timezone.now() + timedelta(minutes=10)  # 10 dəqiqə sonra vaxtı bitir
            
            sms_verification = SMSVerification(
                phone_number=phone_number,
                verification_code=verification_code,
                expires_at=expires_at,
                is_used=True  # Firebase tərəfindən doğrulanmış kodu "istifadə edilmiş" kimi qeyd edirik
            )
            sms_verification.save()
            
            return JsonResponse({'success': True})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})