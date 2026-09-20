import re

files = [
    'src/app/leader/page.tsx',
    'src/app/leader/reports/page.tsx'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We need to add backticks around the select arguments
    # Look for .select( followed by id, ...
    pattern = re.compile(r'\.select\(\s*(id,[\s\S]*?sales:users\(full_name\))\s*\)', re.MULTILINE)
    
    def repl(m):
        return f".select(`\n          {m.group(1)}\n        `)"
    
    new_content = pattern.sub(repl, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
print("Added backticks to select queries.")
