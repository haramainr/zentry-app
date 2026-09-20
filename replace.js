
const fs = require('fs');
let code = fs.readFileSync('src/app/api/generate-pdf/route.ts', 'utf8');

code = code.replace(/fillText\('Text41', data\.routerText, getDynamicFontSize\(data\.routerText\)\);/g, drawCustomFieldText('Text41', data.routerText, 3, 9););
code = code.replace(/fillText\('Text42', data\.smartboxText, getDynamicFontSize\(data\.smartboxText\)\);/g, drawCustomFieldText('Text42', data.smartboxText, 3, 9););
code = code.replace(/fillText\('Text48', data\.customText, getDynamicFontSize\(data\.customText\)\);/g, drawCustomFieldText('Text48', data.customText, 3, 9););
code = code.replace(/fillText\('Text53', data\.addon1Text, getDynamicFontSize\(data\.addon1Text\)\);/g, drawCustomFieldText('Text53', data.addon1Text, 3, 9););
code = code.replace(/fillText\('Text51', vasArray\[0\], getDynamicFontSize\(vasArray\[0\]\)\);/g, drawCustomFieldText('Text51', vasArray[0], 3, 9););
code = code.replace(/fillText\('Text52', vasArray\[1\], getDynamicFontSize\(vasArray\[1\]\)\);/g, drawCustomFieldText('Text52', vasArray[1], 3, 9););
code = code.replace(/fillText\('Text49', remaining, getDynamicFontSize\(remaining\)\);/g, drawCustomFieldText('Text49', remaining, 3, 9););

fs.writeFileSync('src/app/api/generate-pdf/route.ts', code);

