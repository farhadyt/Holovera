# config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns
from django.views.generic import RedirectView
from apps.core.views import HomeView

urlpatterns = [
    # Non-i18n patterns
    path('i18n/', include('django.conf.urls.i18n')),
    # Default redirect to login
    path('', RedirectView.as_view(url='/az/accounts/login/', permanent=False)),
]

# i18n patterns - tərcümə ediləcək URL patternləri
urlpatterns += i18n_patterns(
    path('admin/', admin.site.urls),
    path('accounts/', include('apps.accounts.urls')),
    path('home/', HomeView.as_view(), name='home'),
    prefix_default_language=True  # Bu True olmalıdır
)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)