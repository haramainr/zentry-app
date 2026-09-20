const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function run() {
  const pdfBytes = fs.readFileSync('public/templates/cbn-form-template.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  
  const fields = ['Text1', 'Text7', 'Text12', 'Text13', 'Text14', 'Text9', 'Text11', 'Text10', 'Text16', 'Text25', 'Text15'];
  
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
