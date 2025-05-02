# apps/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserType, AgeRange, SMSVerification

# User admin class
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'name', 'phone_number', 'is_verified', 'is_product_owner', 'is_designer')
    list_filter = ('is_verified', 'is_product_owner', 'is_designer', 'gender')
    search_fields = ('username', 'email', 'name', 'phone_number')
    fieldsets = UserAdmin.fieldsets + (
        ('Holovera Profile', {'fields': ('name', 'phone_number', 'age', 'gender', 'firebase_uid', 
                                        'country', 'date_of_birth', 'profile_image', 'user_types', 
                                        'age_range', 'is_verified')}),
    )

# User Type admin
class UserTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'description')
    search_fields = ('name', 'code')

# Age Range admin
class AgeRangeAdmin(admin.ModelAdmin):
    list_display = ('range_name', 'min_age', 'max_age', 'display_order')
    ordering = ('display_order',)

# SMS Verification admin
class SMSVerificationAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'verification_code', 'created_at', 'expires_at', 'is_used', 'attempts')
    list_filter = ('is_used',)
    search_fields = ('phone_number',)
    readonly_fields = ('created_at', 'expires_at')

# Register models
admin.site.register(User, CustomUserAdmin)
admin.site.register(UserType, UserTypeAdmin)
admin.site.register(AgeRange, AgeRangeAdmin)
admin.site.register(SMSVerification, SMSVerificationAdmin)