import re

file_path = 'src/app/register/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace inline styles with class
old_div = '<div className="login-card-wrapper" style={{ maxHeight: ''90vh'', overflowY: ''auto'', borderRadius: ''24px'', paddingRight: ''10px'' }}>'
new_div = '<div className="login-card-wrapper hide-scrollbar" style={{ maxHeight: ''90vh'', overflowY: ''auto'', borderRadius: ''24px'', paddingRight: ''4px'' }}>'

content = content.replace(old_div, new_div)

# Add hide-scrollbar CSS
css_to_add = '''
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
'''

if '.hide-scrollbar' not in content:
    content = content.replace('</style>', css_to_add + '</style>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated scrollbar CSS.")
