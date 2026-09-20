const fs = require('fs');
let code = fs.readFileSync('src/app/api/generate-pdf/route.ts', 'utf8');

const oldStr1 = "value = value.replace(/[\\u2018\\u2019]/g, \"'\").replace(/[\\u201C\\u201D]/g, '\"').replace(/[\\u2013\\u2014]/g, '-').replace(/[^\\x00-\\x7F]/g, '').replace(/\\r/g, '');";
const newStr1 = "value = value.replace(/[\\u2018\\u2019]/g, \"'\").replace(/[\\u201C\\u201D]/g, '\"').replace(/[\\u2013\\u2014]/g, '-'); value = value.replace(/[^\\x20-\\x7E\\n]/g, ' ');";

const oldStr2 = "cleanValue = cleanValue.replace(/[\\u2018\\u2019]/g, \"'\").replace(/[\\u201C\\u201D]/g, '\"').replace(/[\\u2013\\u2014]/g, '-').replace(/[^\\x00-\\x7F]/g, '').replace(/\\r/g, '');";
const newStr2 = "cleanValue = cleanValue.replace(/[\\u2018\\u2019]/g, \"'\").replace(/[\\u201C\\u201D]/g, '\"').replace(/[\\u2013\\u2014]/g, '-'); cleanValue = cleanValue.replace(/[^\\x20-\\x7E\\n]/g, ' ');";

code = code.split(oldStr1).join(newStr1);
code = code.split(oldStr2).join(newStr2);

fs.writeFileSync('src/app/api/generate-pdf/route.ts', code);
console.log('Done patching.');
