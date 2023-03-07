const express = require('express');
const multer = require('multer');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const app = express();
// configure multer middleware to handle multipart/form-data
const uploadjpg = multer();app.post('/signature', uploadjpg.fields([{ name: 'pdf', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    // get the PDF file buffer and base64 image from the request body
    const pdfBuffer = req.files['pdf'][0].buffer;
    const base64Image = req.files['image'][0].buffer.toString('base64');
    // create a new PDF document from the buffer
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    // add a new page to the PDF document
    const page = pdfDoc.addPage();
    // load the base64 image into a PDF image
    const jpgImage = await pdfDoc.embedJpg(Buffer.from(base64Image, 'base64'));
    // get the width and height of the image
    const { width, height } = jpgImage.scale(1);
    // draw the image onto the PDF page
    page.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
    // get the PDF file buffer with the image added
    const pdfBytes = await pdfDoc.save();
    // set the response headers to indicate a PDF file download
    res.setHeader('Content-Type', 'application/pdf');
    // send the PDF file buffer as the response
    res.send(pdfBytes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// for png

// ...

// start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});