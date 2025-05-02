# apps/accounts/management/commands/setup_initial_data.py
from django.core.management.base import BaseCommand
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import UserType, AgeRange

class Command(BaseCommand):
    help = 'Sets up initial data for the application'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Setting up initial data...'))
        
        # Create user types
        user_types = [
            {
                'name': _('Product Owner'),
                'code': 'product_owner',
                'description': _('Sell your handmade products')
            },
            {
                'name': _('Designer'),
                'code': 'designer',
                'description': _('Create compositions from existing products')
            },
            {
                'name': _('Customer'),
                'code': 'customer',
                'description': _('Order personalized gifts')
            }
        ]
        
        for ut in user_types:
            UserType.objects.update_or_create(
                code=ut['code'],
                defaults={
                    'name': ut['name'],
                    'description': ut['description']
                }
            )
            
        self.stdout.write(self.style.SUCCESS(f'Created {len(user_types)} user types'))
        
        # Create age ranges
        age_ranges = [
            {
                'range_name': '18-24',
                'min_age': 18,
                'max_age': 24,
                'display_order': 1
            },
            {
                'range_name': '25-34',
                'min_age': 25,
                'max_age': 34,
                'display_order': 2
            },
            {
                'range_name': '35-44',
                'min_age': 35,
                'max_age': 44,
                'display_order': 3
            },
            {
                'range_name': '45-54',
                'min_age': 45,
                'max_age': 54,
                'display_order': 4
            },
            {
                'range_name': '55+',
                'min_age': 55,
                'max_age': None,
                'display_order': 5
            }
        ]
        
        for ar in age_ranges:
            AgeRange.objects.update_or_create(
                range_name=ar['range_name'],
                defaults={
                    'min_age': ar['min_age'],
                    'max_age': ar['max_age'],
                    'display_order': ar['display_order']
                }
            )
            
        self.stdout.write(self.style.SUCCESS(f'Created {len(age_ranges)} age ranges'))
        
        self.stdout.write(self.style.SUCCESS('Initial data setup completed successfully!'))