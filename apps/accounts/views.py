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
from django.http import JsonResponse
import phonenumbers
import json
import logging
from .services import SMSService
from .models import User, UserType, AgeRange, SMSVerification
from .forms import CustomLoginForm, CustomRegistrationForm
from .firebase_auth import verify_firebase_token, get_or_create_user
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

# Logger quraşdırma
logger = logging.getLogger(__name__)


class CustomTokenObtainPairView(TokenObtainPairView):
    """JWT token əldə etmək üçün xüsusi view"""
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # IP ünvan məlumatlarını əldə et
        ip_address = self.get_client_ip(request)
        
        # İstifadəçini tap və login cəhdini qeyd et
        if response.status_code == 200:
            try:
                username = request.data.get('username')
                try:
                    user = User.objects.get(username=username)
                except User.DoesNotExist:
                    try:
                        user = User.objects.get(phone_number=username)
                    except User.DoesNotExist:
                        try:
                            user = User.objects.get(email=username)
                        except User.DoesNotExist:
                            return response
                
                # Uğurlu giriş cəhdini qeyd et
                user.record_login_attempt(success=True, ip_address=ip_address)
                
            except Exception as e:
                logger.error(f"Error recording successful login: {e}")
        
        return response
    
    def get_client_ip(self, request):
        """Müştəri IP ünvanını əldə edir"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip




@method_decorator(csrf_exempt, name='dispatch')
class SendVerificationCodeView(View):
    """Telefon nömrəsinə doğrulama kodu göndərir"""
    
    def post(self, request, *args, **kwargs):
        try:
            # JSON verilərini alırıq
            data = json.loads(request.body)
            phone_number = data.get('phone_number')
            
            if not phone_number:
                return JsonResponse({
                    'success': False, 
                    'error': _('Telefon nömrəsi təqdim edilməyib')
                }, status=400)
            
            # Telefon nömrəsini beynəlxalq formata çevir
            try:
                parsed_number = phonenumbers.parse(phone_number, None)
                if not phonenumbers.is_valid_number(parsed_number):
                    return JsonResponse({
                        'success': False, 
                        'error': _('Yanlış telefon nömrəsi formatı')
                    }, status=400)
                
                # Beynəlxalq formata çevir (E.164)
                phone_number = phonenumbers.format_number(
                    parsed_number, 
                    phonenumbers.PhoneNumberFormat.E164
                )
            except Exception as e:
                logger.error(f"Phone parsing error: {str(e)}")
                return JsonResponse({
                    'success': False, 
                    'error': f'Telefon nömrəsi formatı xətası: {str(e)}'
                }, status=400)
            
            # SMS göndər
            success, message = SMSService.send_verification_code(phone_number)
            
            if success:
                return JsonResponse({
                    'success': True,
                    'message': _('Doğrulama kodu göndərildi')
                })
            else:
                logger.error(f"SMS sending error: {message}")
                return JsonResponse({
                    'success': False,
                    'error': message
                }, status=400)
                
        except Exception as e:
            logger.error(f"Unexpected error in SendVerificationCodeView: {str(e)}")
            return JsonResponse({
                'success': False, 
                'error': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class VerifyCodeView(View):
    """Doğrulama kodunu yoxlayır"""
    
    def post(self, request, *args, **kwargs):
        try:
            # JSON verilərini alırıq
            data = json.loads(request.body)
            phone_number = data.get('phone_number')
            verification_code = data.get('verification_code')
            
            if not phone_number or not verification_code:
                return JsonResponse({
                    'success': False, 
                    'error': _('Telefon nömrəsi və doğrulama kodu tələb olunur')
                }, status=400)
            
            # Telefon nömrəsini beynəlxalq formata çevir
            try:
                parsed_number = phonenumbers.parse(phone_number, None)
                phone_number = phonenumbers.format_number(
                    parsed_number, 
                    phonenumbers.PhoneNumberFormat.E164
                )
            except Exception as e:
                logger.error(f"Phone parsing error in verification: {str(e)}")
                return JsonResponse({
                    'success': False, 
                    'error': _('Yanlış telefon nömrəsi formatı')
                }, status=400)
            
            # Kodu yoxla
            success, message = SMSService.verify_code(phone_number, verification_code)
            
            if success:
                # İstifadəçini doğrulanmış kimi işarələ
                try:
                    user = User.objects.get(phone_number=phone_number)
                    user.is_verified = True
                    user.save()
                    logger.info(f"User marked as verified: {phone_number}")
                except User.DoesNotExist:
                    # Qeydiyyat zamanı doğrulama üçün istifadə olunursa, bu xəta normal sayılır
                    logger.debug(f"No user found with phone number: {phone_number} during verification")
                    
                return JsonResponse({
                    'success': True,
                    'message': message
                })
            else:
                logger.warning(f"Verification failed for {phone_number}: {message}")
                return JsonResponse({
                    'success': False,
                    'error': message
                }, status=400)
                
        except Exception as e:
            logger.error(f"Unexpected error in VerifyCodeView: {str(e)}")
            return JsonResponse({
                'success': False, 
                'error': str(e)
            }, status=500)


class LoginView(FormView):
    template_name = 'accounts/login.html'
    form_class = CustomLoginForm
    success_url = reverse_lazy('landing')
    
    def dispatch(self, request, *args, **kwargs):
        # İstifadəçi artıq login olubsa, landing page-ə yönləndir
        if request.user.is_authenticated:
            return redirect('landing')
        return super().dispatch(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from django.conf import settings
        
        # Firebase konfiqurasiyasını JSON formatında ötürmək
        if hasattr(settings, 'FIREBASE_CONFIG') and settings.FIREBASE_CONFIG:
            context['firebase_config'] = json.dumps(settings.FIREBASE_CONFIG)
        return context
    
    def post(self, request, *args, **kwargs):
        # Check if the request is a JSON request
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                phone_number = data.get('phone_number')
                password = data.get('password')
                remember_me = data.get('remember', False)
                is_verified = data.get('verified', False)
                
                # Basic validation
                if not phone_number or not password:
                    return JsonResponse({
                        'success': False,
                        'error': _('Telefon nömrəsi və şifrə tələb olunur')
                    }, status=400)
                
                # Try to find the user
                try:
                    user = User.objects.get(phone_number=phone_number)
                    
                    # Check if user is verified
                    if not user.is_verified and not is_verified:
                        return JsonResponse({
                            'success': False,
                            'error': _('Hesabınız hələ təsdiqlənməyib'),
                            'require_verification': True
                        }, status=403)
                    
                    # Authenticate
                    user = authenticate(username=user.username, password=password)
                    if user is not None:
                        login(request, user)
                        
                        # Set session expiry if remember me is not checked
                        if not remember_me:
                            request.session.set_expiry(0)
                        
                        return JsonResponse({
                            'success': True,
                            'redirect_url': self.get_success_url()
                        })
                    else:
                        return JsonResponse({
                            'success': False,
                            'error': _('Yanlış telefon nömrəsi və ya şifrə')
                        }, status=401)
                        
                except User.DoesNotExist:
                    return JsonResponse({
                        'success': False,
                        'error': _('Yanlış telefon nömrəsi və ya şifrə')
                    }, status=401)
                    
            except json.JSONDecodeError:
                return JsonResponse({
                    'success': False,
                    'error': _('Yanlış JSON formatı')
                }, status=400)
            except Exception as e:
                logger.error(f"Login error: {str(e)}")
                return JsonResponse({
                    'success': False,
                    'error': _('Server xətası')
                }, status=500)
        
        # If not JSON, proceed with form submission
        return super().post(request, *args, **kwargs)
    
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
            return redirect('landing')
        return super().dispatch(request, *args, **kwargs)
    
    def form_valid(self, form):
        user = form.save(commit=False)
        
        # Telefon nömrəsini formdan alırıq
        phone_number = form.cleaned_data.get('phone_number')
        
        # Telefon nömrəsini təmizlə və formatla
        try:
            parsed_number = phonenumbers.parse(phone_number, None)
            if phonenumbers.is_valid_number(parsed_number):
                phone_number = phonenumbers.format_number(
                    parsed_number, 
                    phonenumbers.PhoneNumberFormat.E164
                )
        except Exception as e:
            logger.warning(f"Phone number parsing failed: {str(e)}")
            # Continue with the original value if parsing fails
        
        # İstifadəçi adını telefon nömrəsinə təyin edirik
        user.username = phone_number
        user.phone_number = phone_number
        
        # Şifrəni təyin et
        password = self.request.POST.get('password')
        if password:
            user.set_password(password)
        
        # SMS doğrulaması tamamlanmışsa, istifadəçini doğrulanmış kimi işarələ
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
        
        # Firebase UID əlavə et
        firebase_uid = form.cleaned_data.get('firebase_uid')
        if firebase_uid:
            user.firebase_uid = firebase_uid
        
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

    def post(self, request, *args, **kwargs):
        """
        İstifadəçi qeyd olduqda saxlama prosesin idarə edir
        """
        # Əgər form POST metodu ilə göndərilibsə və doğrulama təsdiqlənibsə
        if 'is_verified' in request.POST:
            try:
                # Form-a POST məlumatlarını doldururuq
                form = self.get_form()
                if form.is_valid():
                    return self.form_valid(form)
                else:
                    return self.form_invalid(form)
            except Exception as e:
                logger.error(f"Registration error: {str(e)}")
                messages.error(request, _("Qeydiyyat zamanı xəta baş verdi: {}").format(str(e)))
                return self.form_invalid(form)
                
        return super().post(request, *args, **kwargs)


@method_decorator(csrf_exempt, name='dispatch')
class VerifyFirebaseTokenView(View):
    """Firebase auth token-ni yoxlayır və istifadəçini login edir"""
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            id_token = data.get('idToken')
            
            if not id_token:
                return JsonResponse({'success': False, 'error': _('Token təqdim edilməyib')}, status=400)
            
            # Firebase token-ı yoxla
            firebase_user = verify_firebase_token(id_token)
            if not firebase_user:
                return JsonResponse({'success': False, 'error': _('Token doğrulanması uğursuz oldu')}, status=401)
            
            # İstifadəçini tap və ya yarat
            user = get_or_create_user(firebase_user)
            if not user:
                return JsonResponse({'success': False, 'error': _('İstifadəçi yaradıla bilmədi')}, status=400)
            
            # User-i login et
            login(request, user)
            
            return JsonResponse({
                'success': True, 
                'redirect_url': request.GET.get('next', str(reverse_lazy('landing')))
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': _('Yanlış JSON formatı')}, status=400)
        except Exception as e:
            logger.error(f"Firebase token verification error: {str(e)}")
            return JsonResponse({'success': False, 'error': str(e)}, status=400)