const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function run() {
  const pdfBytes = fs.readFileSync('./public/templates/cbn-form-template.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  fields.forEach(f => {
    const name = f.getName();
    if (name.includes('Button49') || name.includes('Button50') || name.includes('Button33') || name.includes('Text48') || name.includes('Text51') || name.includes('Text52')) {
      const type = f.constructor.name;
      const widgets = f.acroField.getWidgets();
      let rectStr = '';
      if (widgets.length > 0) {
        const rect = widgets[0].getRectangle();
        rectStr = `x=${Math.round(rect.x)}, y=${Math.round(rect.y)}`;
      }
      console.log(`${name} (${type}): ${rectStr}`);
    }
  });
}
run();
