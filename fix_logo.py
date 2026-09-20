import re

file_path = 'src/app/register/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add the logo box to the card header
target_html = '''<div className="card-header">
                  <h2 className="card-brand-name">ZentryX</h2>
                </div>'''

replacement_html = '''<div className="card-header">
                  <div className="card-logo-box">
                    <Image src="/zentry-logo.png" width={140} height={35} alt="ZEntry Logo" />
                  </div>
                  <h2 className="card-brand-name">ZentryX</h2>
                </div>'''

if target_html in content:
    content = content.replace(target_html, replacement_html)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added logo back to register card.")
else:
    print("Logo target HTML not found.")
