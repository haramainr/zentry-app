import re

file_path = 'src/components/FormWizard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Revert the step content logic (Swap 2 and 3 back)
content = re.sub(r'\{\/\*\s*STEP 2\s*\*\/\}\s*\{currentStep === 2 && \(', r'{/* STEP 3 */}\n          {currentStep === TEMP_3 && (', content)
content = re.sub(r'\{\/\*\s*STEP 3\s*\*\/\}\s*\{currentStep === 3 && \(', r'{/* STEP 2 */}\n          {currentStep === 2 && (', content)
content = content.replace('TEMP_3', '3')

# Also update the validation logic in handleNext
content = re.sub(r'if \(currentStep === 2\) \{', r'if (currentStep === 3) {', content)

# 2. Swap the TITLES and ICONS arrays
old_titles = "const STEP_TITLES = ['Data Pelanggan', 'Paket & Layanan', 'Data Alamat', 'Dokumen', 'Verifikasi', 'Ringkasan'];"
new_titles = "const STEP_TITLES = ['Data Pelanggan', 'Data Alamat', 'Paket & Layanan', 'Dokumen', 'Verifikasi', 'Ringkasan'];"
content = content.replace(old_titles, new_titles)

old_icons = "const STEP_ICONS = ['👤', '📦', '📍', '📄', '✅', '📝'];"
new_icons = "const STEP_ICONS = ['👤', '📍', '📦', '📄', '✅', '📝'];"
content = content.replace(old_icons, new_icons)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Reverted step logic and swapped titles instead.")
