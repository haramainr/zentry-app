import re

file_path = 'src/components/FormWizard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Swap the conditions
# Instead of swapping huge blocks of code, we just change the condition check inside the comments!
content = content.replace('{/* STEP 2 */}\n          {currentStep === 2 && (', '{/* STEP 3 */}\n          {currentStep === 3 && (')
content = content.replace('{/* STEP 3 */}\n          {currentStep === 3 && (', '{/* STEP 2 */}\n          {currentStep === 2 && (')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Swapped Step 2 and Step 3 conditions.")
