const fs = require('fs');

// Fix login.css
let css = fs.readFileSync('src/app/login/login.css', 'utf-8');
css = css.replace(/:global\((.*?)\)/g, '$1');
css = css.replace(/`/g, '');
fs.writeFileSync('src/app/login/login.css', css);

// Fix register.css
css = fs.readFileSync('src/app/register/register.css', 'utf-8');
css = css.replace(/:global\((.*?)\)/g, '$1');
css = css.replace(/`/g, '');
fs.writeFileSync('src/app/register/register.css', css);

// Fix login/page.tsx
let tsx = fs.readFileSync('src/app/login/page.tsx', 'utf-8');
if (tsx.indexOf('"use client";') > 0) {
  tsx = tsx.replace('import \'./login.css\';\n"use client";', '"use client";\nimport \'./login.css\';');
  fs.writeFileSync('src/app/login/page.tsx', tsx);
}

// Fix register/page.tsx
tsx = fs.readFileSync('src/app/register/page.tsx', 'utf-8');
if (tsx.indexOf('"use client";') > 0) {
  tsx = tsx.replace('import \'./register.css\';\n"use client";', '"use client";\nimport \'./register.css\';');
  fs.writeFileSync('src/app/register/page.tsx', tsx);
}

console.log('Fixed CSS and TSX files.');
