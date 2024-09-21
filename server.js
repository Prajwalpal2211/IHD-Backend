const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Feedback = require('./Models/Feedback');  // Assuming you created the feedback model
const xlsx = require('xlsx');
const fs = require('fs');
const dotenv = require('dotenv').config;

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

mongoose.connect('mongodb+srv://ppalgaming2211:S0222p@cluster0.4z6qi4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const imageSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    image: String
});

const Image = mongoose.model('Image', imageSchema);

app.post('/IhdUploadImg', async (req, res) => {
    const { name, description, category, image } = req.body;

    const newImage = new Image({
        name,
        description,    
        category,
        image
    });

    await newImage.save();
    res.send('Image uploaded successfully');
});

app.get('/images/:category', async (req, res) => {
    const { category } = req.params;
    const images = await Image.find({ category });
    res.json(images);
});



app.put('/IhdUploadImg/:id', async (req, res) => {
    const { description } = req.body;
  
    try {
      const updatedImage = await Image.findByIdAndUpdate(req.params.id, { description }, { new: true });
      if (!updatedImage) return res.status(404).json({ message: 'Image not found' });
      res.json(updatedImage);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  app.delete('/delete/:id', async (req, res) => {
    try {
      const deletedImage = await Image.findByIdAndDelete(req.params.id);
      if (!deletedImage) return res.status(404).json({ message: 'Image not found' });
      res.json({ message: 'Image deleted' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    } 
  });


  app.post('/api/feedback', async (req, res) => {
    try {
      const feedback = new Feedback(req.body);
      await feedback.save();
      res.status(201).send({ message: 'Feedback submitted successfully' });
    } catch (error) {
      res.status(500).send({ message: 'Error submitting feedback', error });
    }
  });
  
  // Route to export data to Excel
  app.get('/api/export', async (req, res) => {
    try {
      const feedbacks = await Feedback.find({});
  
      // Create a new Excel workbook and worksheet
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(feedbacks.map(fb => ({
        FullName: fb.fullName,
        Email: fb.email,
        Mobile: fb.mobile,
        Feedback: fb.feedback,
        DateSubmitted: fb.createdAt,
      })));
  
      // Append worksheet to workbook
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Feedbacks');
  
      // Write the workbook to a file
      const excelFile = 'feedbacks.xlsx';
      xlsx.writeFile(workbook, excelFile);
  
      // Send the Excel file to the client
      res.download(excelFile, 'feedbacks.xlsx', (err) => {
        if (err) {
          console.error('Error downloading the file:', err);
          res.status(500).send('Error exporting data');
        }
  
        // Delete the file after sending to avoid clutter
        fs.unlinkSync(excelFile);
      });
  
    } catch (error) {
      res.status(500).send({ message: 'Error exporting feedback data', error });
    }
  });





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
