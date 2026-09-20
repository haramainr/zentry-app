import re

files_to_update = ['src/app/login/page.tsx', 'src/app/register/page.tsx']

for file_path in files_to_update:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the login-page-container class block
    # We want to replace the background-color and background-image properties
    old_css = '''          background-color: #0F172A;
          background-image: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);'''
    
    new_css = '''          background-color: #0F172A;
          background-image: 
            linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.95) 100%),
            url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;'''

    if old_css in content:
        content = content.replace(old_css, new_css)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"Could not find target CSS in {file_path}")
