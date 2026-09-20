const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function run() {
  const pdfBytes = fs.readFileSync('./public/templates/cbn-form-template.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  fields.forEach(f => {
    const name = f.getName();
    const type = f.constructor.name;
    const widgets = f.acroField.getWidgets();
    if (widgets.length > 0) {
      const rect = widgets[0].getRectangle();
      // filter only those roughly in the y=380 to y=500 range
      if (rect.y > 380 && rect.y < 500) {
        console.log(`${name} (${type}): x=${Math.round(rect.x)}, y=${Math.round(rect.y)}, w=${Math.round(rect.width)}, h=${Math.round(rect.height)}`);
      }
    }
  });
}
run();
