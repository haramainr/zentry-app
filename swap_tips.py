import re

file_path = 'src/components/FormWizard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Swap STEP_TIPS index 1 and 2
# I'll use regex to capture the arrays
pattern = re.compile(r'(const STEP_TIPS = \[\n\s*\[(.*?)\]\,\n\s*\[(.*?)\]\,\n\s*\[(.*?)\]\,)', re.DOTALL)

match = pattern.search(content)
if match:
    full_match = match.group(1)
    tip1 = match.group(2)
    tip2 = match.group(3) # Packages
    tip3 = match.group(4) # Address
    
    new_match = f"const STEP_TIPS = [\n      [{tip1}],\n      [{tip3}],\n      [{tip2}],"
    content = content.replace(full_match, new_match)
    print("Swapped STEP_TIPS.")
else:
    print("Failed to match STEP_TIPS.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
