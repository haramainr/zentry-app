const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function run() {
  try {
    const pdfBytes = fs.readFileSync('./public/templates/cbn-form-template.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    for (const f of fields) {
      if (f.constructor.name === 'PDFTextField') {
        const fieldName = f.getName();
        const widgets = f.acroField.getWidgets();
        if (widgets.length > 0) {
          const rect = widgets[0].getRectangle();
          console.log(`${fieldName}: x=${Math.round(rect.x)}, y=${Math.round(rect.y)}, w=${Math.round(rect.width)}, h=${Math.round(rect.height)}`);
        } else {
          console.log(`${fieldName}: no widgets`);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}
run();
