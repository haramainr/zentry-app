import re

file_path = 'src/app/register/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the hidden scrollbar logic with a beautiful transparent scrollbar
target_css = r'''\.login-card-wrapper::-webkit-scrollbar\s*\{\s*display:\s*none;\s*\}\s*\.login-card-wrapper\s*\{\s*-ms-overflow-style:\s*none;\s*scrollbar-width:\s*none;\s*\}'''

new_css = '''
        .login-card-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        .login-card-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        .login-card-wrapper::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.4);
          border-radius: 10px;
        }
        .login-card-wrapper::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.7);
        }
'''

content = re.sub(target_css, new_css.strip(), content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated scrollbar to be transparent and elegant.")
