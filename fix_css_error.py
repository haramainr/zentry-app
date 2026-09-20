import re

file_path = 'src/app/register/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken CSS insertion
broken_css = '''}
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
</style>'''

fixed_css = '''
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      }</style>'''

if broken_css in content:
    content = content.replace(broken_css, fixed_css)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed CSS syntax error.")
else:
    # Just in case it's slightly different
    print("Trying regex fix...")
    content = re.sub(r'\}\s*\.hide-scrollbar', r'\n        .hide-scrollbar', content)
    content = re.sub(r'scrollbar-width: none;\s*\}\s*</style>', r'scrollbar-width: none;\n        }\n      }</style>', content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed CSS syntax error via regex.")

