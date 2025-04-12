# D:\projects\Holovera\compile_messages.py
# Bu skript .po fayllarını .mo fayllarına çevirəcək

import os
import polib
from pathlib import Path

# Layihə qovluğunu təyin edirik
BASE_DIR = Path(__file__).resolve().parent

# Hər bir dil üçün
languages = ['az', 'en', 'ru', 'tr']

for lang in languages:
    try:
        # PO faylının yerini təyin edirik
        po_path = os.path.join(BASE_DIR, 'locale', lang, 'LC_MESSAGES', 'django.po')
        
        # PO faylı mövcuddurmu?
        if os.path.exists(po_path):
            # PO faylını yükləyirik
            po = polib.pofile(po_path)
            
            # MO faylının yerini təyin edirik
            mo_path = os.path.join(BASE_DIR, 'locale', lang, 'LC_MESSAGES', 'django.mo')
            
            # MO faylını yaradırıq
            po.save_as_mofile(mo_path)
            
            print(f"{lang} dili üçün tərcümə faylı kompilyasiya edildi!")
        else:
            print(f"{lang} dili üçün PO faylı tapılmadı!")
    except Exception as e:
        print(f"{lang} dili üçün xəta: {e}")

print("Bütün tərcümə faylları kompilyasiya edildi!")