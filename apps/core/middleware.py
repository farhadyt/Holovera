from django.conf import settings
from django.utils import translation
from django.utils.deprecation import MiddlewareMixin

class LocaleMiddleware(MiddlewareMixin):
    """
    Bu middleware brauzerin dilini aşkarlayır və ilk dəfə səhifəni 
    açarkən bu dilə uyğun tərcümə olunmuş məzmun göstərir.
    """
    def process_request(self, request):
        # Əgər dil artıq POST sorğusunda varsa, onu aktivləşdir
        if request.method == 'POST' and 'language' in request.POST:
            language = request.POST.get('language')
            if language in [lang_code for lang_code, _ in settings.LANGUAGES]:
                translation.activate(language)
                request.session['django_language'] = language
                return None
        
        # İstifadəçi artıq dil seçmişdirsə, onu aktiv et
        if 'django_language' in request.session:
            translation.activate(request.session['django_language'])
            return None
            
        # Brauzer dilini al
        if request.META.get('HTTP_ACCEPT_LANGUAGE'):
            browser_language = request.META.get('HTTP_ACCEPT_LANGUAGE').split(',')[0].split('-')[0]
            
            # Əgər brauzer dili dəstəklənən dillərdən biridisə, onu seç
            available_languages = [lang_code for lang_code, _ in settings.LANGUAGES]
            if browser_language in available_languages:
                translation.activate(browser_language)
                request.session['django_language'] = browser_language
            else:
                # Əgər brauzer dili dəstəklənmirsə, default dili istifadə et
                translation.activate(settings.LANGUAGE_CODE)
                request.session['django_language'] = settings.LANGUAGE_CODE
                
        return None

    def process_response(self, request, response):
        # Əmin olaq ki, seçilən dil cookie-də saxlanılır
        if 'django_language' in request.session:
            response.set_cookie(
                settings.LANGUAGE_COOKIE_NAME,
                request.session['django_language'],
                max_age=settings.LANGUAGE_COOKIE_AGE,
                path=settings.LANGUAGE_COOKIE_PATH,
                domain=settings.LANGUAGE_COOKIE_DOMAIN,
                secure=settings.LANGUAGE_COOKIE_SECURE,
                httponly=settings.LANGUAGE_COOKIE_HTTPONLY,
                samesite=settings.LANGUAGE_COOKIE_SAMESITE,
            )
        return response