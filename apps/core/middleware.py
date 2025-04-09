from django.conf import settings
from django.utils import translation
from django.utils.deprecation import MiddlewareMixin

class LocaleMiddleware(MiddlewareMixin):
    """
    Bu middleware brauzerin dilini aşkarlayır və ilk dəfə səhifəni 
    açarkən bu dilə uyğun tərcümə olunmuş məzmun göstərir.
    """
    def process_request(self, request):
        # İstifadəçi artıq dil seçmişdirsə, heç nə etmə
        if request.session.get('django_language', None):
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