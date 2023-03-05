const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pdfLib = require('pdf-lib');
const fs = require('fs');

// middleware to parse JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  try {
    res.send("SIGNATURE API ENDPOINT")
  }catch (error) {
    console.error(error);
    res.status(500).send('Error merging image into PDF');
  }
});

// API endpoint for merging base64 image into PDF
app.post('/signature', async (req, res) => {
  try {
    const base64Image = req.body.base64Image;
    const pdfFile = req.body.pdfFile;

    // convert base64 image to buffer
    const imageBuffer = Buffer.from(JSON.stringify(base64Image, 'base64'));

    // write binary data to file
    fs.writeFileSync('image.png', imageBuffer);

    const imageDataFromFile = fs.readFileSync('image.png');

    // read PDF file as buffer
    const pdfBuffer = fs.readFileSync(pdfFile);

    // load PDF document
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

    // add image to first page of PDF
    const image = await pdfDoc.embedPng(imageDataFromFile);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    firstPage.drawImage(image, {
      x: 0,
      y: height - image.height,
      width: image.width,
      height: image.height,
    });

    // save modified PDF to buffer
    const modifiedPdfBuffer = await pdfDoc.save();

    // send modified PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.send(modifiedPdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error merging image into PDF');
  }
});

// start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
