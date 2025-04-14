# apps/core/views.py
from django.views.generic import TemplateView
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.mixins import LoginRequiredMixin

class HomeView(LoginRequiredMixin, TemplateView):
    template_name = 'home.html'
    login_url = '/accounts/login/'  # Login olmayan istifadəçiləri hara yönləndirmək
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = _("Holovera - 3D Buket Dizayn Platforması")
        return context
    
class LandingPageView(TemplateView):
    template_name = 'landing_page.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = _("Holovera - 3D Buket Dizayn Platforması")
        return context