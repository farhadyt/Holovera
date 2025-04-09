# Generated by Django 5.1.3 on 2025-04-09 14:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='firebase_uid',
            field=models.CharField(blank=True, max_length=128, null=True, unique=True, verbose_name='Firebase UID'),
        ),
    ]
