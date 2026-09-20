const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function run() {
  const pdfBytes = fs.readFileSync('public/templates/cbn-form-template.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  
  const fields = ['Text43', 'Text44', 'Text3', 'Text4', 'Text5'];
  
  for (const name of fields) {
    try {
      const field = form.getTextField(name);
      const widgets = field.acroField.getWidgets();
      if (widgets.length > 0) {
        const rect = widgets[0].getRectangle();
        console.log(`${name}: width=${rect.width.toFixed(2)}, height=${rect.height.toFixed(2)}, x=${rect.x.toFixed(2)}, y=${rect.y.toFixed(2)}`);
      }
    } catch (e) {
      console.log(`${name} error:`, e.message);
    }
  }
}
run();
