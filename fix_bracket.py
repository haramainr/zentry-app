file_path = 'src/app/login/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# find the block and remove the extra }
for i in range(len(lines)):
    if "return;" in lines[i] and "window.location.href = target;" in lines[i-1]:
        if "}\n" in lines[i+1]:
            # we already have one } inside the string from new_block
            # I'll just delete lines[i+1]
            del lines[i+1]
            break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Removed extra bracket.")
