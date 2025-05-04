# apps/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _  # Bu import əlavə olunmalıdır
from .models import User, UserType, AgeRange, SMSVerification

# Qalan kod eyni qalır...
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'name', 'phone_number', 'is_verified', 'is_product_owner', 'is_designer', 'last_login')
    list_filter = ('is_verified', 'is_product_owner', 'is_designer', 'gender', 'login_method')
    search_fields = ('username', 'email', 'name', 'phone_number')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('name', 'email', 'phone_number', 'gender', 'age', 'date_of_birth')}),
        (_('Profile'), {'fields': ('firebase_uid', 'country', 'profile_image', 'user_types', 'age_range')}),
        (_('Status'), {'fields': ('is_verified', 'login_method', 'failed_login_attempts', 'account_locked_until')}),
        (_('Legacy flags'), {'fields': ('is_product_owner', 'is_designer')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    readonly_fields = ('last_login', 'date_joined')
    
    # Quick actions for admin panel
    actions = ['verify_users', 'unlock_accounts']
    
    def verify_users(self, request, queryset):
        """Seçilmiş istifadəçiləri təsdiqlənmiş olaraq işarələ"""
        updated = queryset.update(is_verified=True)
        self.message_user(request, f"{updated} istifadəçi təsdiqləndi.")
    verify_users.short_description = _("Seçilmiş istifadəçiləri təsdiqlə")
    
    def unlock_accounts(self, request, queryset):
        """Seçilmiş istifadəçi hesablarının kilidini aç"""
        updated = queryset.update(failed_login_attempts=0, account_locked_until=None)
        self.message_user(request, f"{updated} hesabın kilidi açıldı.")
    unlock_accounts.short_description = _("Seçilmiş hesabların kilidini aç")

# User Type admin
class UserTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'description')
    search_fields = ('name', 'code')
    list_filter = ('code',)

# Age Range admin
class AgeRangeAdmin(admin.ModelAdmin):
    list_display = ('range_name', 'min_age', 'max_age', 'display_order')
    ordering = ('display_order',)
    list_editable = ('display_order',)

# SMS Verification admin
class SMSVerificationAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'verification_code', 'created_at', 'expires_at', 'is_used', 'attempts', 'ip_address')
    list_filter = ('is_used', 'created_at')
    search_fields = ('phone_number', 'ip_address')
    readonly_fields = ('created_at', 'expires_at')
    
    # Təhlükəsizlik üçün verifikasiya kodunu gizlətmək üçün metod
    def get_verification_code(self, obj):
        return "******"  # Əsl kodu göstərmə
    get_verification_code.short_description = "Verification Code"
    
    # Bu metodu get_verification_code ilə əvəz etmək üçün
    def get_list_display(self, request):
        list_display = list(self.list_display)
        if not request.user.is_superuser:
            # Superuser olmayan adminlər üçün verifikasiya kodunu gizlə
            idx = list_display.index('verification_code')
            list_display[idx] = 'get_verification_code'
        return list_display

# Register models
admin.site.register(User, CustomUserAdmin)
admin.site.register(UserType, UserTypeAdmin)
admin.site.register(AgeRange, AgeRangeAdmin)
admin.site.register(SMSVerification, SMSVerificationAdmin)