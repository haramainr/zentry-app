import re

file_path = 'src/app/register/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the CSS placement
target = '''      
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      }</style>'''

replacement = '''
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      }</style>'''

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed CSS placement inside backticks.")
else:
    print("Could not find the exact broken string. Attempting regex...")
    # More robust regex
    content = re.sub(r'\n\s*\.hide-scrollbar::-webkit-scrollbar\s*\{\s*display:\s*none;\s*\}\s*\.hide-scrollbar\s*\{\s*-ms-overflow-style:\s*none;\s*scrollbar-width:\s*none;\s*\}\s*\}</style>', replacement, content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Used regex to fix.")
