const fs = require('fs');
const { PDFDocument, PDFTextField, PDFCheckBox } = require('pdf-lib');

async function run() {
  const pdfBytes = fs.readFileSync('public/templates/cbn-form-template.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  
  const fields = form.getFields();
  console.log(`Total fields: ${fields.length}`);
  
  for (const field of fields) {
    const name = field.getName();
    let type = 'Unknown';
    if (field instanceof PDFTextField) type = 'TextField';
    else if (field instanceof PDFCheckBox) type = 'CheckBox';
    
    let rectStr = '';
    try {
      const widgets = field.acroField.getWidgets();
      if (widgets.length > 0) {
        const rect = widgets[0].getRectangle();
        rectStr = `[w:${rect.width.toFixed(2)}, h:${rect.height.toFixed(2)}]`;
      }
    } catch(e) {}
    
    console.log(`- ${name} (${type}) ${rectStr}`);
  }
}
run();
