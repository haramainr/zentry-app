import re

file_path = 'src/components/FormWizard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will use a temporary placeholder to prevent double swapping
content = re.sub(r'\{\/\*\s*STEP 2\s*\*\/\}\s*\{currentStep === 2 && \(', r'{/* STEP 3 */}\n          {currentStep === TEMP_3 && (', content)
content = re.sub(r'\{\/\*\s*STEP 3\s*\*\/\}\s*\{currentStep === 3 && \(', r'{/* STEP 2 */}\n          {currentStep === 2 && (', content)
content = content.replace('TEMP_3', '3')

# Also update the validation logic in handleNext
content = re.sub(r'if \(currentStep === 3\) \{', r'if (currentStep === 2) {', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Swapped Step 2 and Step 3 UI and validation.")
