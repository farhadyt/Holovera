# apps/accounts/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic import FormView, CreateView, View
from django.utils.translation import gettext_lazy as _  # Tərcümə üçün
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
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
        user.username = user.phone_number  # Phone number as username
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