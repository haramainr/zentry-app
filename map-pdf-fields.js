const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function mapFields() {
  try {
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'cbn-form-template.pdf');
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    let fieldData = [];
    
    fields.forEach(f => {
      const name = f.getName();
      let type = 'Unknown';
      let x = 0, y = 0;
      
      if (f.constructor.name === 'PDFTextField') {
        type = 'Text';
        const widgets = f.acroField.getWidgets();
        if(widgets.length > 0) {
          const rect = widgets[0].getRectangle();
          x = Math.round(rect.x);
          y = Math.round(rect.y);
        }
      } else if (f.constructor.name === 'PDFCheckBox') {
        type = 'Checkbox';
        const widgets = f.acroField.getWidgets();
        if(widgets.length > 0) {
          const rect = widgets[0].getRectangle();
          x = Math.round(rect.x);
          y = Math.round(rect.y);
        }
      }
      
      fieldData.push({ name, type, x, y });
    });
    
    // Sort by Y descending (top to bottom), then by X ascending (left to right)
    fieldData.sort((a, b) => {
      if (b.y !== a.y) {
        return b.y - a.y; // Higher Y means closer to top of page
      }
      return a.x - b.x;
    });
    
    console.log("=== FIELD MAPPING (Top to Bottom) ===");
    fieldData.forEach((f, i) => {
      console.log(`${i + 1}. [${f.type}] ${f.name} (X: ${f.x}, Y: ${f.y})`);
    });
    
  } catch (e) {
    console.error(e);
  }
}
mapFields();
