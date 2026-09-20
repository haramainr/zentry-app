const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function run() {
  try {
    const oldPdfBytes = fs.readFileSync('F:/Zentry/temp_extract/public/templates/cbn-form-template.pdf');
    const newPdfBytes = fs.readFileSync('F:/Zentry/ZEntry_Trial-main/public/templates/cbn-form-template.pdf');

    const oldPdfDoc = await PDFDocument.load(oldPdfBytes);
    const newPdfDoc = await PDFDocument.load(newPdfBytes);

    const [embeddedPage] = await oldPdfDoc.embedPdf(newPdfDoc, [0]);

    const pages = oldPdfDoc.getPages();
    const firstPage = pages[0];

    // Overlay the new visual design on top of the old PDF.
    // The AcroForm fields (Annotations) naturally render above page content in PDF viewers!
    firstPage.drawPage(embeddedPage, {
      x: 0,
      y: 0,
      width: firstPage.getWidth(),
      height: firstPage.getHeight(),
    });

    const finalBytes = await oldPdfDoc.save();
    fs.writeFileSync('F:/Zentry/ZEntry_Trial-main/public/templates/cbn-form-template.pdf', finalBytes);
    console.log('Successfully merged new design with old form fields!');
  } catch (e) {
    console.error('Error:', e);
  }
}
run();
