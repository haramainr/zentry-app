import re

file_path = 'src/app/leader/reports/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("filename={Laporan_Tim_.csv}", 'filename={"Laporan_Tim_" + new Date().toISOString().split("T")[0] + ".csv"}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed filename prop.")
