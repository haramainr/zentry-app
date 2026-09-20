Bisa banget, dan sebenarnya ada cara yang jauh lebih rapi daripada bikin box satu-satu manual — namanya **Comb Field**, fitur bawaan di spesifikasi PDF (AcroForm) yang memang didesain untuk kasus ini (kotak per huruf/angka, biasa dipakai di formulir NIK, KTP, dll).

**Cara kerja Comb Field:**
Kamu cukup buat satu text field dengan lebar sesuai jumlah karakter maksimal (misal 16 kotak untuk NIK), set `MaxLength = 16`, lalu aktifkan flag "Comb". PDF renderer (Adobe Reader, browser, dll) otomatis akan membagi field itu menjadi kotak-kotak sama besar dan menaruh satu karakter per kotak — kamu nggak perlu gambar garis pemisah manual.

**Library yang recommended: `pdf-lib`** (JS/Node, cocok untuk web app)

```js
const { PDFDocument } = require('pdf-lib');

const pdfDoc = await PDFDocument.load(templateBytes);
const form = pdfDoc.getForm();
const page = pdfDoc.getPage(0);

const nikField = form.createTextField('nik');
nikField.setMaxLength(16);
nikField.enableCombing(); // <-- ini kuncinya
nikField.addToPage(page, {
  x: 150, y: 700,
  width: 320,   // lebar total, otomatis dibagi 16 kotak
  height: 20,
  borderWidth: 1,
});

form.getTextField('nik').setText('3273010101990001');

const pdfBytes = await pdfDoc.save();
```

Kalau template PDF kamu sudah punya form field bawaan (dibuat lewat Adobe Acrobat/LibreOffice), kamu tinggal ambil field yang sudah ada:
```js
const field = form.getTextField('nik');
field.setMaxLength(16);
field.enableCombing();
field.setText(dataFromUser.nik);
```

**Kalau nanti mau di-flatten** (biar hasil akhirnya fixed, nggak bisa diedit lagi) pakai `form.flatten()` sebelum save — tapi test dulu, karena beberapa renderer saat flatten kadang tidak selalu menjaga garis pembatas comb dengan sempurna, tergantung versi.

**Kalau template kamu bukan AcroForm** (misalnya PDF hasil scan/gambar statis yang kotak-kotaknya sudah tercetak sebagai gambar, bukan field asli), maka nggak bisa pakai comb field — solusinya draw manual per karakter pakai `page.drawText()`, tapi otomatis lewat loop, bukan bikin box satu-satu:

```js
function drawCharGrid(page, text, x, y, cellWidth, maxChars, font, size) {
  const chars = text.toUpperCase().padEnd(maxChars, ' ').slice(0, maxChars).split('');
  chars.forEach((ch, i) => {
    const cx = x + i * cellWidth;
    const w = font.widthOfTextAtSize(ch, size);
    page.drawText(ch, { x: cx + (cellWidth - w) / 2, y, size, font });
  });
}
```

Ini menghilangkan kerjaan manual "bikin box satu-satu" — kamu cukup tentukan posisi awal, lebar kotak, dan jumlah maksimal karakter, sisanya otomatis.

Boleh tahu, template PDF kamu itu sudah punya form field (AcroForm) atau masih PDF/gambar statis yang kotaknya sudah tercetak? Itu menentukan pendekatan mana yang paling cocok buat kasus kamu (misalnya untuk ZEntry).