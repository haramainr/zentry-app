import re

files_to_update = ['src/app/login/page.tsx', 'src/app/register/page.tsx']

css_to_add = '''        .form-input:-webkit-autofill,
        .form-input:-webkit-autofill:hover, 
        .form-input:-webkit-autofill:focus, 
        .form-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #FFFFFF inset !important;
          -webkit-text-fill-color: #0F172A !important;
          transition: background-color 5000s ease-in-out 0s;
        }'''

for file_path in files_to_update:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find where to insert it, maybe after .form-input::placeholder
    target = '''        .form-input::placeholder {
          color: #94A3B8;
          font-weight: 400;
        }'''
    
    if target in content and '-webkit-autofill' not in content:
        content = content.replace(target, target + '\n\n' + css_to_add)
        
        # Also change input-container background to solid white so it blends perfectly
        content = content.replace('background: rgba(255, 255, 255, 0.9);', 'background: #FFFFFF;')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"Could not find target CSS in {file_path}")
