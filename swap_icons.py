import re

file_path = 'src/components/FormWizard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the array elements directly using regex or by index if needed
# Actually, I'll just find the line and replace the whole line
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'const STEP_ICONS =' in line:
        # The line is something like: const STEP_ICONS = ['👤', '📦', '📍', '📄', '✅', '📝'];
        # I want to swap index 1 and index 2
        # So I will just hardcode the new line with emojis
        lines[i] = "  const STEP_ICONS = ['👤', '📍', '📦', '📄', '✅', '📝'];"
        break

content = '\n'.join(lines)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Swapped icons safely.")
