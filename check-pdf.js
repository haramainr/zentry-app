const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function run() {
  try {
    const pdfBytes = fs.readFileSync('./public/templates/cbn-form-template.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    console.log("Number of form fields:", fields.length);
    fields.forEach(f => {
      console.log(f.getName());
    });
  } catch (e) {
    console.error(e);
  }
}
run();
